# todo-tanstack 🌴 (Premium Notion-Style Todo PWA)

A high-performance, minimalist Todo Progressive Web App (PWA) built with **TanStack Start**. Designed with an absolute black (#000000) Notion-style aesthetic, this application provides a premium, distraction-free experience for managing tasks across devices.

## ✨ Core Features

- **🎯 Premium Aesthetic**: Minimalist, absolute black (#000000) UI inspired by Notion's clean design system.
- **📱 PWA Ready**: Full Progressive Web App support with `sw.js` and `manifest.json` for home screen installation and offline capabilities.
- **🔐 Secure Access**: Protected by custom JWT-based authentication.
- **📂 Task Categories**: Organize your life with built-in categories: **Work**, **Personal**, and **Urgent**.
- **⚡ High Performance**: Powered by TanStack Start for lightning-fast transitions and server-side rendering benefits.

## 🛠 Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start)
- **Styling**: Tailwind CSS (Custom Absolute Black Theme)
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Bare-metal Node.js

---

## 🚀 Bare-Metal Deployment Guide (Riyadh Server)

This guide outlines the steps for a professional "No-Docker" deployment on a Riyadh-based bare-metal Ubuntu/Debian server.

### 1. Prerequisites

Ensure your server has Node.js (LTS) and npm installed:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Environment Configuration

The application requires specific environment variables for authentication and networking. Create a `.env` file in the root directory:

```env
PORT=3000
TODO_PASSWORD=your_secure_password # Fallback: poke123
JWT_SECRET=your_jwt_secret_key
```

### 3. Build & Production Prep

Install dependencies and generate the production build:

```bash
# Install dependencies
npm install

# Build the TanStack Start application
npm run build
```

### 4. Systemd Service Management

To ensure the application remains active and restarts automatically after reboots, create a systemd service unit.

Create the file: `/etc/systemd/system/todo-tanstack.service`

```ini
[Unit]
Description=todo-tanstack 🌴 - Premium Notion-Style Todo PWA
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/todo-tanstack
ExecStart=/usr/bin/npm run start
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=TODO_PASSWORD=your_secure_password

[Install]
WantedBy=multi-user.target
```

**Enable and Start the Service:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable todo-tanstack
sudo systemctl start todo-tanstack
```

### 5. Reverse Proxy & SSL (Cloudflare Tunnel)

It is highly recommended to expose the application via a **Cloudflare Tunnel** for secure, low-latency access in Riyadh without opening public ports.

1. Install `cloudflared` on your server.
2. Authenticate and create a tunnel: `cloudflared tunnel create todo-pwa`
3. Route the tunnel to the application port:
   ```yaml
   ingress:
     - hostname: todo.yourdomain.com
       service: http://localhost:3000
     - service: http_status:404
   ```
4. Run the tunnel as a service.

Alternatively, use **Nginx** pointing directly to port `3000` with an SSL certificate from Let's Encrypt.

---

## 🔒 Authentication Philosophy

The app uses a strict JWT-based validation layer. Access is granted by validating against the `TODO_PASSWORD` environment variable. If no variable is provided, the system defaults to `poke123` for initial setup.

---

Designed with ❤️ for high-performance productivity.
