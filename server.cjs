const express = require('express')
const Database = require('better-sqlite3')
const path = require('path')
const crypto = require('crypto')

const app = express()
require('dotenv').config()
const PORT = process.env.PORT || 3001
const PASSWORD = process.env.TODO_PASSWORD || 'poke123'

// Init DB
const db = new Database(path.join(__dirname, 'todo.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    category TEXT DEFAULT 'Personal',
    created_at INTEGER DEFAULT (strftime('%s','now'))
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS subtasks (
    id TEXT PRIMARY KEY,
    todo_id TEXT NOT NULL,
    text TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s','now')),
    FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
  )
`)

app.use(express.json())
app.use(express.static(path.join(__dirname, 'dist')))

// Simple token auth
const tokens = new Map() // token -> expiry

function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const expiry = tokens.get(token)
  if (Date.now() > expiry) {
    tokens.delete(token)
    return res.status(401).json({ error: 'Token expired' })
  }
  // Extend session
  tokens.set(token, Date.now() + 7 * 24 * 60 * 60 * 1000)
  next()
}

// Auth
app.post('/api/login', (req, res) => {
  const { password } = req.body
  if (password === PASSWORD) {
    const token = crypto.randomBytes(32).toString('hex')
    tokens.set(token, Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    return res.json({ token })
  }
  res.status(401).json({ error: 'Invalid password' })
})

// Include subtasks in todo response
app.get('/api/todos', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all()
  const result = rows.map(r => {
    const subs = db.prepare('SELECT * FROM subtasks WHERE todo_id = ? ORDER BY created_at ASC').all(r.id)
    return { ...r, completed: !!r.completed, subtasks: subs.map(s => ({ ...s, completed: !!s.completed })) }
  })
  res.json(result)
})

// Create todo
app.post('/api/todos', auth, (req, res) => {
  const { text, category = 'Personal' } = req.body
  if (!text?.trim()) return res.status(400).json({ error: 'Text required' })
  const id = Date.now().toString() + crypto.randomBytes(4).toString('hex')
  db.prepare('INSERT INTO todos (id, text, category) VALUES (?, ?, ?)').run(id, text, category)
  const row = db.prepare('SELECT * FROM todos WHERE id = ?').get(id)
  res.json({ ...row, completed: !!row.completed })
})

// Toggle todo
app.patch('/api/todos/:id', auth, (req, res) => {
  const { id } = req.params
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id)
  if (!todo) return res.status(404).json({ error: 'Not found' })

  if (req.body.completed !== undefined) {
    db.prepare('UPDATE todos SET completed = ? WHERE id = ?').run(req.body.completed ? 1 : 0, id)
  }
  if (req.body.text !== undefined) {
    db.prepare('UPDATE todos SET text = ? WHERE id = ?').run(req.body.text, id)
  }
  if (req.body.category !== undefined) {
    db.prepare('UPDATE todos SET category = ? WHERE id = ?').run(req.body.category, id)
  }
  const row = db.prepare('SELECT * FROM todos WHERE id = ?').get(id)
  res.json({ ...row, completed: !!row.completed })
})

// Delete todo (cascade deletes subtasks)
app.delete('/api/todos/:id', auth, (req, res) => {
  db.prepare('DELETE FROM subtasks WHERE todo_id = ?').run(req.params.id)
  db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// --- Subtasks ---

// Get subtasks for a todo
app.get('/api/todos/:id/subtasks', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM subtasks WHERE todo_id = ? ORDER BY created_at ASC').all(req.params.id)
  res.json(rows.map(r => ({ ...r, completed: !!r.completed })))
})

// Create subtask
app.post('/api/todos/:id/subtasks', auth, (req, res) => {
  const { text } = req.body
  if (!text?.trim()) return res.status(400).json({ error: 'Text required' })
  const todo = db.prepare('SELECT id FROM todos WHERE id = ?').get(req.params.id)
  if (!todo) return res.status(404).json({ error: 'Todo not found' })
  const id = Date.now().toString() + crypto.randomBytes(4).toString('hex')
  db.prepare('INSERT INTO subtasks (id, todo_id, text) VALUES (?, ?, ?)').run(id, req.params.id, text)
  const row = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id)
  res.json({ ...row, completed: !!row.completed })
})

// Toggle/update subtask
app.patch('/api/todos/:todoId/subtasks/:subId', auth, (req, res) => {
  const sub = db.prepare('SELECT * FROM subtasks WHERE id = ? AND todo_id = ?').get(req.params.subId, req.params.todoId)
  if (!sub) return res.status(404).json({ error: 'Subtask not found' })
  if (req.body.completed !== undefined) {
    db.prepare('UPDATE subtasks SET completed = ? WHERE id = ?').run(req.body.completed ? 1 : 0, req.params.subId)
  }
  if (req.body.text !== undefined) {
    db.prepare('UPDATE subtasks SET text = ? WHERE id = ?').run(req.body.text, req.params.subId)
  }
  const row = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(req.params.subId)
  res.json({ ...row, completed: !!row.completed })
})

// Delete subtask
app.delete('/api/todos/:todoId/subtasks/:subId', auth, (req, res) => {
  db.prepare('DELETE FROM subtasks WHERE id = ? AND todo_id = ?').run(req.params.subId, req.params.todoId)
  res.json({ ok: true })
})

// SPA fallback
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Todo server running on http://0.0.0.0:${PORT}`)
})
