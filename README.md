# Todo PWA

A minimalist, Notion-style todo app with subtasks, categories, and cross-device sync.

## Features

- **Tasks & Subtasks** — Add optional subtasks to any task, with expand/collapse
- **Categories** — Personal, Work, Urgent, Server, Home, App (with color-coded badges)
- **Filter Pills** — Filter by category, horizontally scrollable on mobile
- **Sections** — Active tasks grouped by category, collapsible completed section
- **Clear Completed** — Bulk delete all completed tasks
- **Auth** — Password-protected with 7-day token sessions
- **Mobile Responsive** — Touch-friendly, no iOS zoom, safe-area notch support, PWA installable
- **Dark Theme** — Absolute black (`#000000`) Notion-style aesthetic

## Tech Stack

- **Frontend**: Vite + React + Tailwind CSS
- **Backend**: Express.js (`server.cjs`) serving both API and static files
- **Database**: SQLite3 (`better-sqlite3`) with WAL mode
- **Auth**: Token-based (7-day expiry, auto-extended on each request)

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/login` | Authenticate with password, returns token |
| `GET` | `/api/todos` | Get all todos (includes subtasks) |
| `POST` | `/api/todos` | Create a todo |
| `PATCH` | `/api/todos/:id` | Update todo (text, completed, category) |
| `DELETE` | `/api/todos/:id` | Delete todo (cascades subtasks) |
| `POST` | `/api/todos/:id/subtasks` | Create a subtask |
| `PATCH` | `/api/todos/:todoId/subtasks/:subId` | Update subtask |
| `DELETE` | `/api/todos/:todoId/subtasks/:subId` | Delete subtask |

## Deployment

### Build

```bash
npm install
npm run build
```

### Run

```bash
node server.cjs
```

Listens on port `3001` by default.

### Systemd Service

The app runs as a systemd service `todo-app`:

```bash
sudo systemctl restart todo-app
sudo systemctl status todo-app
```

Service file: `/etc/systemd/system/todo-app.service`

### Nginx (optional reverse proxy)

```nginx
location /todo {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Database Schema

```sql
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  category TEXT DEFAULT 'Personal',
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE subtasks (
  id TEXT PRIMARY KEY,
  todo_id TEXT NOT NULL,
  text TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s','now')),
  FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
);
```

## Project Structure

```
todo/
├── server.cjs          # Express server (API + static serving)
├── src/
│   ├── App.tsx         # Main React component
│   ├── main.tsx        # React entry point
│   └── styles.css      # Tailwind + custom dark theme + mobile responsive
├── dist/               # Built production assets
├── index.html          # HTML entry (PWA meta tags)
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind config
├── package.json
└── .gitignore
```
