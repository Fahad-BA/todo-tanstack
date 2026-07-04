# 📝 Todo PWA

![Static Badge](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)
![Static Badge](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Static Badge](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)
![Static Badge](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Static Badge](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![Static Badge](https://img.shields.io/badge/License-MIT-22c55e)

> A minimalist, **Notion-style** todo app with subtasks, categories, and cross-device sync.
> Absolute black (`#000000`) aesthetic. Dark by design.

---

## ✨ Features

- 📋 **Tasks & Subtasks** — Add optional subtasks to any task, with expand/collapse
- 🏷️ **Categories** — `Personal` `Work` `Urgent` `Server` `Home` `App` (color-coded badges)
- 🔍 **Filter Pills** — Filter by category, horizontally scrollable on mobile
- 📂 **Sections** — Active tasks grouped by category, collapsible completed section
- 🧹 **Clear Completed** — Bulk delete all completed tasks in one click
- 🔐 **Auth** — Password-protected with 7-day token sessions (auto-extended)
- 📱 **Mobile Responsive** — Touch-friendly, no iOS zoom, safe-area notch support, PWA installable
- 🎨 **Dark Theme** — Absolute black Notion-style aesthetic, always dark, always clean

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| ⚡ **Frontend** | Vite + React 19 + Tailwind CSS |
| 🖥️ **Backend** | Express.js (`server.cjs`) — serves API + static files |
| 🗄️ **Database** | SQLite3 (`better-sqlite3`) with WAL mode |
| 🔑 **Auth** | Token-based, 7-day expiry, auto-extended on each request |

---

## 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| 🔓 `POST` | `/api/login` | Authenticate with password → returns token |
| 📋 `GET` | `/api/todos` | Get all todos (includes subtasks) |
| ➕ `POST` | `/api/todos` | Create a todo |
| ✏️ `PATCH` | `/api/todos/:id` | Update todo (text, completed, category) |
| 🗑️ `DELETE` | `/api/todos/:id` | Delete todo (cascades subtasks) |
| ➕ `POST` | `/api/todos/:id/subtasks` | Create a subtask |
| ✏️ `PATCH` | `/api/todos/:todoId/subtasks/:subId` | Update subtask |
| 🗑️ `DELETE` | `/api/todos/:todoId/subtasks/:subId` | Delete subtask |

---

## 🗄️ Database Schema

```sql
📋 todos
├── id          TEXT PRIMARY KEY
├── text        TEXT NOT NULL
├── completed   INTEGER DEFAULT 0
├── category    TEXT DEFAULT 'Personal'
└── created_at  INTEGER DEFAULT (strftime('%s','now'))

📌 subtasks
├── id          TEXT PRIMARY KEY
├── todo_id     TEXT NOT NULL → todos.id (CASCADE)
├── text        TEXT NOT NULL
├── completed   INTEGER DEFAULT 0
└── created_at  INTEGER DEFAULT (strftime('%s','now'))
```

---

## 🚀 Deployment

### 🔨 Build

```bash
npm install
npm run build
```

### ▶️ Run

```bash
node server.cjs    # Listens on port 3001
```

### ⚙️ Systemd Service

```bash
sudo systemctl restart todo-app
sudo systemctl status todo-app
```

Service file: `/etc/systemd/system/todo-app.service`

### 🌐 Nginx (optional reverse proxy)

```nginx
location /todo {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## 📁 Project Structure

```
todo/
├── 🖥️ server.cjs          # Express server (API + static serving)
├── 📂 src/
│   ├── ⚛️ App.tsx         # Main React component
│   ├── 🚀 main.tsx        # React entry point
│   └── 🎨 styles.css      # Tailwind + dark theme + mobile responsive
├── 📂 dist/               # Built production assets
├── 🌐 index.html          # HTML entry (PWA meta tags)
├── ⚡ vite.config.ts      # Vite configuration
├── 🎨 tailwind.config.js  # Tailwind config
├── 📦 package.json
└── 🚫 .gitignore
```

---

## 📱 PWA Support

Add to home screen on iOS/Android for a native-like experience:

- 📲 `apple-mobile-web-app-capable` — Standalone mode
- 🖤 `black-translucent` status bar
- 🔒 `viewport-fit=cover` — Notch safe area

---

Made with ❤️ by [Fahad](https://github.com/Fahad-BA) · Powered by ☕ and 🎵
