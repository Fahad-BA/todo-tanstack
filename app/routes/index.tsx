import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Trash2, Plus, CheckCircle2, Circle, Tag } from 'lucide-react'

export const Route = createFileRoute('/')({
  beforeLoad: ({ location }) => {
    // Basic JWT check (mocked for this implementation)
    // In a real app, you'd check a cookie or localstorage
    // For this PWA, we'll handle the UI state in the component
  },
  component: TodoApp,
})

type Todo = {
  id: string
  text: string
  completed: boolean
  category: string
}

function TodoApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [category, setCategory] = useState('Personal')

  useEffect(() => {
    const auth = localStorage.getItem('todo_auth')
    if (auth === 'true') setIsAuthenticated(true)
    
    const saved = localStorage.getItem('todos')
    if (saved) setTodos(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const validPass = 'poke123' // Fallback
    if (password === validPass) {
      setIsAuthenticated(true)
      localStorage.setItem('todo_auth', 'true')
    } else {
      alert('Invalid Password')
    }
  }

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return
    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      category,
    }
    setTodos([todo, ...todos])
    setNewTodo('')
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="w-full max-w-md notion-card p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Todo TanStack</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Password"
              className="w-full p-3 notion-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full p-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors">
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight">Tasks</h1>
          <button 
            onClick={() => { localStorage.removeItem('todo_auth'); setIsAuthenticated(false); }}
            className="text-sm text-gray-400 hover:text-white"
          >
            Logout
          </button>
        </header>

        <form onSubmit={addTodo} className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="What needs to be done?"
              className="flex-1 p-4 notion-input text-lg"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
            />
            <select 
              className="p-4 notion-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Personal</option>
              <option>Work</option>
              <option>Urgent</option>
            </select>
            <button className="p-4 bg-white text-black rounded-md font-bold flex items-center justify-center gap-2 hover:bg-gray-200">
              <Plus size={20} /> Add
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {todos.map(todo => (
            <div key={todo.id} className="group flex items-center gap-4 p-4 notion-card hover:border-gray-500 transition-all">
              <button onClick={() => toggleTodo(todo.id)} className="text-gray-400 hover:text-white">
                {todo.completed ? <CheckCircle2 className="text-green-500" /> : <Circle />}
              </button>
              <div className="flex-1">
                <p className={`text-lg ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                  {todo.text}
                </p>
                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Tag size={12} /> {todo.category}
                </span>
              </div>
              <button 
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-500 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {todos.length === 0 && (
            <p className="text-center text-gray-500 py-12">No tasks found. Start by adding one!</p>
          )}
        </div>
      </div>
    </div>
  )
}