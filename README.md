# Nodely 🚀

A modern visual API builder created with **Svelte 5**, **SvelteKit**, **Tailwind CSS**, and **Svelte Flow** (`@xyflow/svelte`). Build, wire, and test backend APIs visually with drag-and-drop nodes and JavaScript/TypeScript code blocks.

---

## ✨ Features

- **Interactive Node Canvas**:
  - Pan, zoom, minimap, background grid, and connection handles powered by Svelte Flow.
  - Dedicated handles following modern accessible drag UX patterns.
- **Node Types**:
  - 🌐 **HTTP Trigger**: Entrypoint route for `GET`, `POST`, `PUT`, `DELETE`, `PATCH`.
  - 💻 **Code Block**: In-node JavaScript editor with access to `payload`, `query`, `headers`, `state`, `store`, and `log()`.
  - 🔀 **Conditional**: Evaluates boolean expressions and splits flow into **TRUE** and **FALSE** branch handles.
  - 📡 **External API Fetch**: Calls 3rd-party REST endpoints and feeds data into subsequent nodes.
  - 💾 **Data Store**: Mock database / key-value store with `GET`, `SET`, `DELETE`, and `LIST` operations.
  - 📤 **HTTP Response**: Configurable status code (`200`, `201`, `400`, `401`, `500`) and JSON body output.
- **Live In-Browser API Test Runner**:
  - Send simulated HTTP requests directly from the slide-out test runner drawer.
  - Step-by-step **Execution Trace** showing execution order, duration per node, inputs, and outputs.
  - Real-time console logs inspection.
- **Code Export**:
  - 1-click export to production-ready **SvelteKit** server endpoints (`+server.ts`).
  - Export to **Express.js** route handlers.
  - Export to Flow JSON Schema.
- **Pre-Built Starter Templates**:
  - *User Registration & Validation* (POST endpoint with auth validation & storage).
  - *Weather Data Aggregator* (GET endpoint with external API fetch & transform).
  - *Note Storage & List* (CRUD database simulation).

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
npm run preview
```

### 4. Run Type Diagnostics
```bash
npm run check
```

---

## 📁 Project Structure

```
Nodely/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── nodes/
│   │   │   │   ├── TriggerNode.svelte       # HTTP Trigger node
│   │   │   │   ├── CodeBlockNode.svelte     # Custom code block node
│   │   │   │   ├── ConditionalNode.svelte   # Branching condition node
│   │   │   │   ├── FetchNode.svelte         # HTTP Fetch node
│   │   │   │   ├── DataStoreNode.svelte     # Mock DB node
│   │   │   │   └── ResponseNode.svelte      # Terminal HTTP response node
│   │   │   ├── FlowCanvas.svelte            # Main flow canvas workspace
│   │   │   ├── Navbar.svelte                # Top navigation & template selector
│   │   │   ├── Sidebar.svelte               # Draggable node palette
│   │   │   ├── TestPanel.svelte             # Live API request runner & trace inspector
│   │   │   └── ExportModal.svelte           # Code generation export modal
│   │   ├── engine/
│   │   │   ├── executor.ts                  # Graph traversal & execution engine
│   │   │   └── generator.ts                 # SvelteKit & Express code generator
│   │   ├── templates.ts                     # Pre-built API pipeline templates
│   │   └── types.ts                         # Core TypeScript models
│   └── routes/
│       ├── +layout.svelte                   # Base layout
│       ├── +page.svelte                     # Main Nodely page
│       └── api/run/+server.ts               # Server execution endpoint
└── package.json
```
