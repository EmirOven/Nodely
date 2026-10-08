# Nodely ⚡

<p align="center">
  <strong>Visual drag-and-drop API builder and live execution runtime powered by Svelte 5 & Bun.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Svelte-5.x-orange.svg" alt="Svelte 5" />
  <img src="https://img.shields.io/badge/Runtime-Bun%201.2-f472b6.svg" alt="Bun Runtime" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.x-38bdf8.svg" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Engine-Svelte%20Flow-6366f1.svg" alt="Svelte Flow" />
  <img src="https://img.shields.io/badge/License-MIT-emerald.svg" alt="License MIT" />
</p>

---

## 📖 Overview

**Nodely** is a visual backend API playground and self-hostable service. Build endpoints visually by chaining request triggers, custom JavaScript/TypeScript code blocks, conditional logic, and database operations. 

Hit **"Publish API"** to immediately host and serve your visual pipelines as live, publicly reachable HTTP endpoints on the built-in server runtime.

---

## ✨ Features

- 🎨 **Visual Flow Canvas**: Pan, zoom, minimap, background grid, and edge connection handles powered by Svelte Flow (`@xyflow/svelte`).
- 🧩 **Drag & Drop Nodes**:
  - 🌐 **HTTP Trigger**: API entrypoint defining methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) and route paths.
  - 💻 **Code Block**: In-node JavaScript editor with full access to `payload`, `query`, `headers`, `state`, `store`, and `log()`.
  - 🔀 **Conditional Branching**: Evaluates dynamic expressions and splits downstream flow into **TRUE** and **FALSE** paths.
  - 📡 **External API Fetch**: Calls external REST APIs and passes JSON payloads down the pipeline.
  - 💾 **Data Store**: In-memory database simulation supporting `get`, `set`, `delete`, and `list` operations.
  - 📤 **HTTP Response**: Configurable status codes (`200`, `201`, `400`, `404`, `500`) and JSON body builders.
- ✂️ **Connection Management**:
  - **Right-click on any connection** to open a context menu and delete the edge.
  - Click on edges and press `Backspace` / `Delete` to remove.
  - Right-click nodes to duplicate or delete.
- 🚀 **Live API Hosting & Publishing**:
  - Click **"Publish API"** to deploy workflows directly to the live server.
  - Serves endpoints instantly under `/api/[...endpoint]` (e.g. `GET /api/v1/weather` or `POST /api/v1/auth/register`).
  - Persistent storage in `.nodely-published.json` so published APIs survive server restarts.
- 🧪 **Interactive Test Runner & Execution Trace**:
  - Send simulated HTTP requests with custom headers, query params, and JSON bodies.
  - Inspect a step-by-step **Execution Trace** showing node runtimes, inputs, outputs, and console logs.
- 💻 **Code Export**:
  - Export to standalone, production-ready **SvelteKit server routes** (`+server.ts`).
  - Export to **Express.js / Node.js** route handlers.
  - Export to Flow JSON Schema.
- 📦 **Templates**: Includes *Weather Data Aggregator*, *User Registration & Auth*, *Note CRUD*, *Simple Hello Starter*, and *Blank Canvas*.

---

## 🏗️ Architecture

```
Incoming Request
      │
      ▼
┌────────────────────────────────────────────────────────┐
│  SvelteKit Dynamic Route: /api/[...endpoint]           │
└────────────────────────────────────────────────────────┘
      │
      ▼
┌────────────────────────────────────────────────────────┐
│  Published Store Registry (.nodely-published.json)     │
└────────────────────────────────────────────────────────┘
      │
      ▼
┌────────────────────────────────────────────────────────┐
│  Execution Engine (src/lib/engine/executor.ts)         │
│  Traverses Nodes & Evaluates JavaScript Code Blocks    │
└────────────────────────────────────────────────────────┘
      │
      ▼
HTTP Response (Status 200/400/500 + JSON Headers & Body)
```

---

## 🚀 Quickstart (Local Development)

### Prerequisites
- [Bun](https://bun.sh/) (v1.2+ recommended) or Node.js (v20+)

### 1. Clone & Install
```bash
git clone https://github.com/EmirOven/Nodely.git
cd Nodely
bun install
```

### 2. Start Dev Server
```bash
bun run dev -- --open
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Self-Hosting Guide

Nodely is built with `@sveltejs/adapter-node` and can be self-hosted anywhere with Docker, Bun, systemd, or reverse proxies.

### Option A: Docker & Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/EmirOven/Nodely.git
   cd Nodely
   ```

2. **Launch via Docker Compose:**
   ```bash
   docker compose up -d
   ```

3. Nodely will be accessible on port `3000`:
   - Web UI: `http://localhost:3000`
   - Published APIs: `http://localhost:3000/api/v1/weather`

Published endpoints are persisted on the host in `.nodely-published.json`.

---

### Option B: Bare-Metal / VPS with Bun

1. **Build the production bundle:**
   ```bash
   bun install --frozen-lockfile
   bun run build
   ```

2. **Start the production server:**
   ```bash
   PORT=3000 HOST=0.0.0.0 bun run start
   ```

---

### Option C: Process Manager (PM2)

```bash
# Build
bun run build

# Start with PM2
pm2 start ./build/index.js --name nodely --interpreter bun --env PORT=3000
pm2 save
```

---

### Option D: Systemd Service (Linux)

Create `/etc/systemd/system/nodely.service`:

```ini
[Unit]
Description=Nodely Visual API Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/nodely
ExecStart=/usr/local/bin/bun /var/www/nodely/build/index.js
Restart=always
RestartSec=5
Environment=PORT=3000
Environment=HOST=127.0.0.1
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now nodely
```

---

### Option E: Reverse Proxy Setup

#### Nginx
```nginx
server {
    listen 80;
    server_name nodely.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Caddy
```caddyfile
nodely.yourdomain.com {
    reverse_proxy 127.0.0.1:3000
}
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port for the standalone server |
| `HOST` | `0.0.0.0` | Host binding address |
| `NODE_ENV` | `production` | Node environment |
| `ORIGIN` | `http://localhost:3000` | Protocol & domain origin for CORS/preflight |

---

## 🛠️ Development Scripts

```bash
bun run dev          # Start local development server with HMR
bun run build        # Build production bundle with @sveltejs/adapter-node
bun run start        # Launch production server from ./build
bun run check        # Run Svelte and TypeScript static type diagnostics
bun run format       # Format files with Prettier
```

---

## 📄 License

MIT License. Free for personal and commercial use.
