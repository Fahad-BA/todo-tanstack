import { useState, useEffect, useCallback } from 'react'
import { Trash2, Plus, CheckCircle2, Circle, Tag, LogOut } from 'lucide-react'

type Todo = {
  id: string
  text: string
  completed: boolean
  category: string
}

const API = '/api'

function getHeaders() {
  const token = localStorage.getItem('todo_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [category, setCategory] = useState('Personal')
  const [loading, setLoading] = useState(false)

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('todo_token')
    if (!token) return false
    try {
      const res = await fetch(`${API}/todos`, { headers: getHeaders() })
      if (res.ok) return true
      localStorage.removeItem('todo_token')
      return false
    } catch {
      return false
    }
  }, [])

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch(`${API}/todos`, { headers: getHeaders() })
      if (res.ok) setTodos(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    checkAuth().then(authed => {
      if (authed) {
        setIsAuthenticated(true)
        fetchTodos()
      }
    })
  }, [checkAuth, fetchTodos])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        const { token } = await res.json()
        localStorage.setItem('todo_token', token)
        setIsAuthenticated(true)
        setPassword('')
        fetchTodos()
      } else {
        alert('الباسوورد غلط')
      }
    } catch {
      alert('خطأ في الاتصال')
    }
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('todo_token')
    setIsAuthenticated(false)
    setTodos([])
  }

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return
    const tempText = newTodo
    const tempCat = category
    setNewTodo('')
    try {
      const res = await fetch(`${API}/todos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text: tempText, category: tempCat }),
      })
      if (res.ok) {
        const todo = await res.json()
        setTodos(prev => [todo, ...prev])
      }
    } catch {}
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
    try {
      await fetch(`${API}/todos/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ completed: !todo.completed }),
      })
    } catch {
      // Revert on failure
      setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: todo.completed } : t))
    }
  }

  const deleteTodo = async (id: string) => {
    const prev = todos
    setTodos(todos.filter(t => t.id !== id))
    try {
      await fetch(`${API}/todos/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    } catch {
      setTodos(prev)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="w-full max-w-md notion-card p-8">
          <div className="text-center mb-8">
            <div className="inline-block w-16 h-16 bg-white rounded-2xl mb-4 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-black" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Todo</h1>
            <p className="text-gray-500 mt-2 text-sm">أدخل الباسوورد للمتابعة</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              className="w-full p-4 notion-input text-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button
              className="w-full p-4 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '...' : 'Login'}
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
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </header>

        <form onSubmit={addTodo} className="mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="What needs to be done?"
              className="flex-1 p-4 notion-input text-lg"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
            />
            <select
              className="p-4 notion-input min-w-[140px]"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Personal</option>
              <option>Work</option>
              <option>Urgent</option>
            </select>
            <button className="p-4 bg-white text-black rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-200 px-6">
              <Plus size={20} /> Add
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {todos.map(todo => (
            <div
              key={todo.id}
              className="group flex items-center gap-4 p-4 notion-card"
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className="flex-shrink-0"
              >
                {todo.completed
                  ? <CheckCircle2 className="text-green-500" size={22} />
                  : <Circle className="text-gray-600 hover:text-gray-400" size={22} />
                }
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-lg ${todo.completed ? 'line-through text-gray-600' : ''}`}>
                  {todo.text}
                </p>
                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Tag size={11} /> {todo.category}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-500 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {todos.length === 0 && (
            <div className="text-center text-gray-600 py-20">
              <CheckCircle2 size={48} className="mx-auto mb-4 opacity-30" />
              <p>No tasks yet. Add one above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
