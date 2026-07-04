const express = require('express')
const Database = require('better-sqlite3')
const path = require('path')
const crypto = require('crypto')

const app = express()
const PORT = 3001
const PASSWORD = 'poke123'

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

// Get all todos
app.get('/api/todos', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all()
  res.json(rows.map(r => ({ ...r, completed: !!r.completed })))
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

// Delete todo
app.delete('/api/todos/:id', auth, (req, res) => {
  db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// SPA fallback
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Todo server running on http://0.0.0.0:${PORT}`)
})
