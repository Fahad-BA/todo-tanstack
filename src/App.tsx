import { useState, useEffect, useCallback, useMemo } from 'react'
import { Trash2, Plus, CheckCircle2, Circle, Tag, LogOut, ChevronDown, ChevronRight, ListChecks } from 'lucide-react'

type Subtask = {
  id: string
  todo_id: string
  text: string
  completed: boolean
}

type Todo = {
  id: string
  text: string
  completed: boolean
  category: string
  subtasks?: Subtask[]
}

const API = '/api'

function getHeaders() {
  const token = localStorage.getItem('todo_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  Personal: '#5b21b6',
  Work: '#1e40af',
  Urgent: '#991b1b',
  Server: '#0891b2',
  Home: '#16a34a',
  App: '#c026d3',
}

function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] || '#374151'
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1"
      style={{
        backgroundColor: color + '33',
        color: color === '#374151' ? '#9ca3af' : `${color}cc`,
        border: `1px solid ${color}55`,
      }}
    >
      <Tag size={10} /> {category}
    </span>
  )
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onAddSubtask: (todoId: string, text: string) => void
  onToggleSubtask: (todoId: string, subId: string) => void
  onDeleteSubtask: (todoId: string, subId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [subInput, setSubInput] = useState('')
  const [showSubInput, setShowSubInput] = useState(false)

  const completedSubs = todo.subtasks?.filter(s => s.completed).length || 0
  const totalSubs = todo.subtasks?.length || 0

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subInput.trim()) return
    onAddSubtask(todo.id, subInput)
    setSubInput('')
    setShowSubInput(false)
    setExpanded(true)
  }

  return (
    <>
      <div
        key={todo.id}
        className="group flex items-center gap-3 p-3 notion-card"
      >
        {/* Expand button (only if has subtasks or expanded) */}
        {(totalSubs > 0 || expanded) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 text-gray-600 hover:text-gray-300 transition-colors"
          >
            {expanded
              ? <ChevronDown size={16} />
              : <ChevronRight size={16} />
            }
          </button>
        )}

        <button
          onClick={() => onToggle(todo.id)}
          className="flex-shrink-0"
        >
          {todo.completed
            ? <CheckCircle2 className="text-green-600" size={20} />
            : <Circle className="text-gray-600 hover:text-gray-300 transition-colors" size={20} />
          }
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-base ${todo.completed ? 'line-through text-gray-500' : ''}`}>
            {todo.text}
          </p>
          {totalSubs > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-gray-600 hover:text-gray-400 mt-0.5 flex items-center gap-1"
            >
              <ListChecks size={11} />
              {completedSubs}/{totalSubs} subtasks
            </button>
          )}
        </div>

        {/* Add subtask button */}
        {!todo.completed && (
          <button
            onClick={() => { setShowSubInput(!showSubInput); setExpanded(true) }}
            className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-gray-300 transition-all"
            title="Add subtask"
          >
            <Plus size={16} />
          </button>
        )}

        <button
          onClick={() => onDelete(todo.id)}
          className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-500 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Subtask input */}
      {showSubInput && (
        <form onSubmit={handleAddSub} className="flex gap-2 mt-1 ml-8">
          <input
            type="text"
            placeholder="Add a subtask..."
            className="flex-1 p-2.5 notion-input text-sm"
            value={subInput}
            onChange={(e) => setSubInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="px-3 py-2 bg-[#222] text-gray-300 rounded-md text-sm hover:bg-[#2a2a2a]">
            Add
          </button>
          <button type="button" onClick={() => setShowSubInput(false)} className="px-2 py-2 text-gray-600 hover:text-gray-400 text-sm">
            Cancel
          </button>
        </form>
      )}

      {/* Subtasks list */}
      {expanded && totalSubs > 0 && (
        <div className="ml-8 mt-1 mb-2 space-y-0.5 border-l border-[#222] pl-4">
          {todo.subtasks!.map(sub => (
            <div
              key={sub.id}
              className="group/sub flex items-center gap-3 py-1.5"
            >
              <button onClick={() => onToggleSubtask(todo.id, sub.id)} className="flex-shrink-0">
                {sub.completed
                  ? <CheckCircle2 className="text-green-700" size={15} />
                  : <Circle className="text-gray-700 hover:text-gray-500" size={15} />
                }
              </button>
              <span className={`flex-1 text-sm ${sub.completed ? 'line-through text-gray-700' : 'text-gray-400'}`}>
                {sub.text}
              </span>
              <button
                onClick={() => onDeleteSubtask(todo.id, sub.id)}
                className="opacity-0 group-hover/sub:opacity-100 text-gray-700 hover:text-red-500 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [category, setCategory] = useState('Personal')
  const [loading, setLoading] = useState(false)
  const [filterCat, setFilterCat] = useState('All')
  const [showCompleted, setShowCompleted] = useState(true)

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
    checkAuth().then((authed) => {
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
        alert('Wrong password')
      }
    } catch {
      alert('Connection error')
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
        setTodos((prev) => [todo, ...prev])
      }
    } catch {}
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
    try {
      await fetch(`${API}/todos/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ completed: !todo.completed }),
      })
    } catch {
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: todo.completed } : t)))
    }
  }

  const deleteTodo = async (id: string) => {
    const prev = todos
    setTodos(todos.filter((t) => t.id !== id))
    try {
      await fetch(`${API}/todos/${id}`, { method: 'DELETE', headers: getHeaders() })
    } catch {
      setTodos(prev)
    }
  }

  const clearCompleted = async () => {
    const completed = todos.filter((t) => t.completed)
    for (const t of completed) {
      try {
        await fetch(`${API}/todos/${t.id}`, { method: 'DELETE', headers: getHeaders() })
      } catch {}
    }
    setTodos((prev) => prev.filter((t) => !t.completed))
  }

  // Subtask handlers
  const addSubtask = async (todoId: string, text: string) => {
    try {
      const res = await fetch(`${API}/todos/${todoId}/subtasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text }),
      })
      if (res.ok) {
        const sub = await res.json()
        setTodos((prev) =>
          prev.map((t) =>
            t.id === todoId
              ? { ...t, subtasks: [...(t.subtasks || []), sub] }
              : t
          )
        )
      }
    } catch {}
  }

  const toggleSubtask = async (todoId: string, subId: string) => {
    const todo = todos.find((t) => t.id === todoId)
    const sub = todo?.subtasks?.find((s) => s.id === subId)
    if (!sub) return
    // Optimistic update
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId
          ? {
              ...t,
              subtasks: t.subtasks?.map((s) =>
                s.id === subId ? { ...s, completed: !s.completed } : s
              ),
            }
          : t
      )
    )
    try {
      await fetch(`${API}/todos/${todoId}/subtasks/${subId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ completed: !sub.completed }),
      })
    } catch {
      // Revert
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todoId
            ? {
                ...t,
                subtasks: t.subtasks?.map((s) =>
                  s.id === subId ? { ...s, completed: sub.completed } : s
                ),
              }
            : t
        )
      )
    }
  }

  const deleteSubtask = async (todoId: string, subId: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId
          ? { ...t, subtasks: t.subtasks?.filter((s) => s.id !== subId) }
          : t
      )
    )
    try {
      await fetch(`${API}/todos/${todoId}/subtasks/${subId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    } catch {}
  }

  // Filtered lists
  const categories = useMemo(() => {
    const cats = new Set(todos.map((t) => t.category))
    return ['All', ...Array.from(cats)]
  }, [todos])

  const activeTodos = useMemo(
    () =>
      todos
        .filter((t) => !t.completed)
        .filter((t) => filterCat === 'All' || t.category === filterCat)
        .sort((a, b) => a.category.localeCompare(b.category)),
    [todos, filterCat]
  )

  const completedTodos = useMemo(
    () =>
      todos
        .filter((t) => t.completed)
        .filter((t) => filterCat === 'All' || t.category === filterCat)
        .sort((a, b) => a.category.localeCompare(b.category)),
    [todos, filterCat]
  )

  const groupedActive = useMemo(() => {
    const groups: Record<string, Todo[]> = {}
    for (const t of activeTodos) {
      if (!groups[t.category]) groups[t.category] = []
      groups[t.category].push(t)
    }
    return groups
  }, [activeTodos])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="w-full max-w-md notion-card p-8">
          <div className="text-center mb-8">
            <div className="inline-block w-16 h-16 bg-white rounded-2xl mb-4 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-black" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Todo</h1>
            <p className="text-gray-500 mt-2 text-sm">Enter your password to continue</p>
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
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Tasks</h1>
            <p className="text-gray-500 text-sm mt-1">
              {activeTodos.length} active · {completedTodos.length} completed
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </header>

        {/* Filter pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterCat === cat
                  ? 'bg-white text-black'
                  : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-[#333]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Add form */}
        <form onSubmit={addTodo} className="mb-10">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Add a new task..."
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
              <option>Server</option>
              <option>Home</option>
              <option>App</option>
            </select>
            <button className="p-4 bg-white text-black rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-200 px-6">
              <Plus size={20} /> Add
            </button>
          </div>
        </form>

        {/* Active Tasks Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-white rounded-full" />
            <h2 className="text-sm font-bold tracking-wider text-gray-300 uppercase">
              Tasks · {activeTodos.length}
            </h2>
          </div>

          {Object.keys(groupedActive).length === 0 ? (
            <div className="text-center text-gray-600 py-12">
              <CheckCircle2 size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No tasks yet. Add one above!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedActive).map(([cat, items]) => (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <CategoryBadge category={cat} />
                    <span className="text-xs text-gray-600">{items.length}</span>
                    <div className="flex-1 h-px bg-[#1a1a1a]" />
                  </div>
                  <div className="space-y-1">
                    {items.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={toggleTodo}
                        onDelete={deleteTodo}
                        onAddSubtask={addSubtask}
                        onToggleSubtask={toggleSubtask}
                        onDeleteSubtask={deleteSubtask}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Section */}
        {completedTodos.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 group"
              >
                <div className="w-1 h-5 bg-green-600 rounded-full" />
                <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
                  Completed · {completedTodos.length}
                </h2>
                {showCompleted ? (
                  <ChevronDown size={16} className="text-gray-500" />
                ) : (
                  <ChevronRight size={16} className="text-gray-500" />
                )}
              </button>
              <button
                onClick={clearCompleted}
                className="text-xs text-gray-600 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            </div>

            {showCompleted && (
              <div className="space-y-1">
                {completedTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onAddSubtask={addSubtask}
                    onToggleSubtask={toggleSubtask}
                    onDeleteSubtask={deleteSubtask}
                  />
                ))}
              </div>
            )}
          </div>
        )}


      </div>
    </div>
  )
}
