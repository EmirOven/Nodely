# Changelog

All notable changes to the Nodely project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.5.0] - 2026-10-08

### Added
- **Complete Rebrand to Nodeflow**:
  - Rebranded the platform name from Nodely to **Nodeflow** across all application headers, navigation bars, page titles, settings, and landing site.
- **Telegram Bot API Platform Integration**:
  - **Telegram Bot Webhook Trigger (`telegramTrigger`)**:
    - Captures inbound Telegram updates from bot webhooks.
    - Parses chat ID, message text, commands (`/start`, `/help`, etc.), sender info, and callback data into execution state (`state.telegram`).
    - Optional command filter with quick selector pills.
  - **Telegram Send Message Node (`telegramSendMessage`)**:
    - Sends outgoing messages, photos with captions, or callback query answers via Telegram Bot API (`https://api.telegram.org/bot<token>/...`).
    - Supports dynamic templating (`{{aiResponse.text}}`, `{{telegram.sender.firstName}}`), parse modes (`HTML`, `MarkdownV2`, `None`), and live execution or simulated test dispatch.
  - **Telegram Bot Settings & Verification**:
    - Dedicated Telegram Bot API configuration in `/settings`.
    - Live token verification test endpoint (`/api/settings/test-telegram`) with `@BotFather` setup instructions.
  - **Pre-Built AI Telegram Bot Blueprint (`telegram-bot`)**:
    - 1-click template combining Telegram Webhook -> AI Completion -> Telegram Send Message.
- **Single-Endpoint HTTP Trigger Guardrails**:
  - **1 Trigger per Method Constraint**: Strictly enforces that a Nodeflow project can have at most one HTTP trigger per method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
  - **Locked Endpoint URL**: Removed manual route editing on HTTP trigger nodes; endpoints are locked directly to the parent Nodeflow endpoint route.
  - **Educational Custom Method Selector**: Replaced native HTML select with a custom dropdown featuring deep architectural guidance on what each HTTP method does, idempotency, best practices, and disabling methods already in use in the flow.
- **Comprehensive Multi-Format Favicons**:
  - Generated binary `favicon.ico` and `favicon.png` icons alongside `favicon.svg` with cache-busting headers for both the engine and landing website.

---

## [0.4.1] - 2026-10-08

### Added
- **Official Brand Favicon (`favicon.svg`)**:
  - Rendered the official Nodely gradient brand icon (diagonal `#2563eb` -> `#6366f1` -> `#a855f7` squircle with centered white Lucide Network node glyph) as an SVG favicon.
  - Linked brand favicon in `app.html` for the primary Nodely web dashboard and engine.
  - Replaced landing site favicon (`Nodely-Landing/public/favicon.svg`) with the matching brand identity SVG.

### Changed
- Bumped application version to `0.4.1` across `package.json`, navbar badges, and dashboard headers.

---

## [0.4.0] - 2026-10-08

### Added
- **Universal Generic AI Node (`aiNode`)**:
  - Transformed the OpenAI completion node into a versatile, multi-provider AI node compatible with Vercel AI SDK conventions.
  - Supports multiple leading AI providers out-of-the-box:
    - **OpenAI**: `gpt-4o-mini`, `gpt-4o`, `gpt-3.5-turbo`, `o1-mini`, `o3-mini`
    - **Anthropic Claude**: `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`, `claude-3-opus-20240229`
    - **Google Gemini**: `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash`
    - **Groq**: `llama-3.3-70b-versatile`, `mixtral-8x7b-32768`, `gemma2-9b-it`
    - **Ollama / Custom API**: `llama3.2`, `deepseek-r1`, `mistral`, `qwen2.5`, or custom model IDs with configurable Base URL
  - Direct execution support across all providers with automated fallback simulation for local test runs.
  - Generates AI SDK compatible code in both SvelteKit and Express exporters.
  - Configurable system prompts, user prompt templates with variable interpolation (`{{payload.field}}`), temperature slider, max tokens, and format toggle (Text vs JSON Object).
- **Multi-Provider AI Settings in Settings (`/settings`)**:
  - Tabbed interface to manage credentials for OpenAI, Anthropic Claude, Google Gemini, Groq, and Ollama/Custom endpoints.
  - Live API key verification tester per provider.
  - Global default model and temperature controls.

### Changed
- **Terminology Shift to "Nodeflows"**:
  - Replaced all legacy references to "projects" and "API routes" across navigation tabs, headers, modal dialogs, and cards with **Nodeflows**.
  - Root route (`/`) navigation and titles updated to visual Nodeflow management.
  - Navbar and settings navigation cleanly link to "Nodeflows".
- **User Management Node Cleanup**:
  - Completely removed external vendor mentions (Supabase) from the User Management node header, badges, and sidebar descriptions.
- Bumped project version to `0.4.0` in `package.json`, navbar badges, and dashboard headers.

---

## [0.3.0] - 2026-10-08

### Added
- **Google Auth Node (`googleAuthNode`)**:
  - Validates Google OAuth ID tokens from either incoming headers (`Authorization: Bearer <token>`) or request payload (`payload.credential` / `payload.id_token`).
  - Automatically decodes token claims (email, name, picture, subject ID, audience, expiration).
  - Verifies Client ID audience matching and token validity.
  - Exposes dedicated dual branch handles: `Valid` (emerald) and `Invalid` (rose), passing verified user claims to downstream nodes in the pipeline.
- **User Management Node (`userManagementNode`)**:
  - Full node-based, Supabase-style user authentication and account management for projects created with Nodely.
  - Supports 6 distinct lifecycle actions:
    - `signup`: Creates new accounts with salted SHA-256 password hashing and initial roles.
    - `login`: Verifies user credentials, updates last sign-in timestamp, and issues bearer session tokens.
    - `getUser`: Retrieves user profiles by ID or email expression.
    - `updateUser`: Updates profile fields (name, role, password).
    - `deleteUser`: Permanently deletes a user from the project database.
    - `listUsers`: Fetches paginated user lists with role and query filters.
  - Supports dynamic expression interpolation (e.g. `{{payload.email}}`, `{{payload.password}}`).
  - Exposes dual branching: `Success` (emerald) and `Error` (rose).
- **OpenAI Node (`openAiNode`)**:
  - LLM completion node with model selection (`gpt-4o-mini`, `gpt-4o`, `gpt-3.5-turbo`, `o1-mini`).
  - Supports system prompt, user prompt with variable interpolation (e.g. `{{payload.prompt}}`), temperature slider, max tokens, and response formatting (`text` vs `json_object`).
  - Uses OpenAI API key configured in Project Settings (or node-level override) with automatic fallback simulation when running in mock test mode.
  - Exposes dual branching: `Success` (emerald) and `Error` (rose).
- **Project Settings & Secrets Page (`/settings`)**:
  - Dedicated configuration dashboard for environment secrets and defaults.
  - OpenAI API Key configuration with live connection testing ("Verify OpenAI Connection" button).
  - Google OAuth Client ID & Client Secret management with configuration guide links.
  - JWT secret key manager with one-click cryptographically secure token generator and expiration controls.
  - Gateway CORS origin controls.
  - Local disk persistence via `.nodely-settings.json` and REST endpoints at `/api/settings`.
- **Project Users Management Page (`/users`)**:
  - Supabase-style user dashboard for managing all accounts created across nodeflow applications.
  - Real-time user statistics: Total Users, Active Users, Google OAuth Users, and Banned Accounts.
  - Search and filter by role (`user`, `admin`, `moderator`), provider (`email`, `google`), and status (`active`, `banned`).
  - Manual user creation modal with password and role configuration.
  - Edit user profile modal (name, role, password reset).
  - One-click account ban / unban toggle.
  - User deletion modal with confirmation.
  - Local disk persistence via `.nodely-users.json` and REST endpoints at `/api/users` and `/api/users/[id]`.
- **Unified Header Navigation**:
  - Added global top-level navigation tabs (`API Routes`, `Project Users`, `Settings`) across the Route Browser (`/`), User Directory (`/users`), Settings (`/settings`), and Visual Editor (`Navbar.svelte`).
- **Code Generation & Execution Support**:
  - Added full execution support for `googleAuthNode`, `userManagementNode`, and `openAiNode` in `src/lib/engine/executor.ts`.
  - Added code generation support for all 3 nodes in both SvelteKit and Express exporters (`src/lib/engine/generator.ts`).

### Changed
- Bumped project version to `0.3.0` across `package.json`, navbar badges, and dashboard headers.

---

## [0.2.1] - 2026-10-08

### Fixed
- **Dev Server Refresh on Publish/Take Down**:
  - Configured Vite's file watcher (`vite.config.ts`) with `server.watch.ignored: ['**/.nodely*.json', '**/.nodely*/**', '**/build/**']`.
  - Writing route state and published configurations to disk (`.nodely-routes.json`, `.nodely-published.json`) no longer triggers HMR page reloads or dependency re-bundling.

### Added
- **Per-Card Isolated Loading State**:
  - When toggling an endpoint between Live and Draft, only the targeted project card transitions into an isolated loading state with smooth backdrop blur and animated status radar.
  - Distinct contextual action feedback: "Hosting Endpoint Live..." (emerald spinner) or "Taking Endpoint Down..." (amber spinner).
  - All other project cards remain completely visible, interactable, and unaffected.
- **Route Pre-Hydration & Skeleton States**:
  - Implemented `src/routes/+page.ts` SvelteKit load function to pre-hydrate routes during SSR/navigation, eliminating blank flashes.
  - Added skeleton loading cards for initial loads without cached data.
  - Added non-intrusive background sync badge in the top navigation header during manual or background refreshes.

### Changed
- Bumped project version to `0.2.1` in `package.json`, navbar badges, and dashboard headers.

---

## [0.2.0] - 2026-10-08

### Added
- **API Route Browser & Dashboard (`/`)**:
  - Converted the root index route into a centralized API browser and endpoint management dashboard.
  - Displays all created API endpoints with HTTP method pills (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`), live/draft status indicators, node pipeline summaries, and quick-copy endpoint URLs.
- **Multi-Route Management Engine**:
  - Persistent server route store (`routeStore.ts` & `.nodely-routes.json`) with full CRUD API endpoints (`/api/routes` and `/api/routes/[id]`).
  - Seamlessly keeps live published endpoints (`publishedStore.ts`) in sync with route statuses.
- **Interactive Route Creation**:
  - Modal enabling users to specify route title, method, path, and starter blueprint (`Blank`, `Simple Starter`, `Auth & Validation`, `API Aggregator`, `Note CRUD`).
  - Automatically provisions the route and redirects to the visual editor.
- **cURL Snippets & Live Request Tester**:
  - Modal providing copyable cURL commands for each hosted route.
  - Integrated live test trigger that sends HTTP requests to the local gateway and displays status code, headers, and JSON responses.
- **Visual Editor Deep Linking (`/editor/[id]`)**:
  - Dedicated dynamic routes for editing each API pipeline independently.
  - Top navigation bar now includes "Back to All Routes", current endpoint path pill, and "Save Workflow" action.

### Changed
- Bumped project version to `0.2.0` in `package.json`, navbar badges, and documentation.

---

## [0.1.0] - 2026-10-08

### Added
- **Auth Gate Node (`authNode`)**:
  - Middleware security node supporting API Key header checks and Bearer JWT token matching.
  - Dedicated branching with `VALID` (authorized) and `INVALID` (401 response) output handles.
- **Schema Validator Node (`validatorNode`)**:
  - Validates request payload keys before executing downstream business logic.
  - Generates detailed missing field error arrays when inputs fail validation.
- **Delay / Sleep Node (`delayNode`)**:
  - Asynchronous delay node (configurable up to 30s) for rate pacing, mock latency testing, and webhook throttling.
- **Dashed & Colored Edge Styles**:
  - Live connection drag previews now show styled dashed lines (`connectionLineStyle`).
  - SvelteFlow `onbeforeconnect` and `defaultEdgeOptions` properly assign vibrant themed colors and dashed animations:
    - Success/True/Valid branches: Emerald green (`#10b981`)
    - Error/False/Invalid branches: Rose red (`#ef4444`)
    - Standard data pipelines: Indigo (`#6366f1`)
- **Code Generation Support**:
  - Updated both SvelteKit and Express code exporters to generate code for `authNode`, `validatorNode`, and `delayNode`.

### Changed
- **Template Node Spacing**:
  - Increased vertical spacing across all starter templates (`user-auth`, `weather-api`, `note-crud`, `empty`) from cramped 15–40px gaps to 100–140px clear breathing room.
  - Completely resolved node overlaps between `CodeBlock` and subsequent nodes (`Conditional`, `Response`, `DataStore`).
- **Version Number**:
  - Bumped project version to `0.1.0` in `package.json` and UI badges.

### Fixed
- **Solid White User Connection Lines**:
  - Fixed issue where user-drawn edges in the flow canvas were rendered as solid white lines by properly attaching `onbeforeconnect`, animated flags, and theme styles before edge registration.

---

## [0.0.1] - 2026-10-08

### Initial Release
- Svelte 5 + SvelteKit visual API builder with `@xyflow/svelte`.
- Drag-and-drop palette featuring HTTP Trigger, Code Block, Conditional Branch, External API Fetch, Data Store, and HTTP Response nodes.
- In-browser API execution simulator with step-by-step trace and live console logs.
- Dynamic live API publishing engine (`/api/[...endpoint]`) with persistent local disk storage.
- SvelteKit and Express server-side code generator modal.
- Right-click context menus for deleting/duplicating nodes and deleting connections.
- Self-hosting dockerization support (`Dockerfile`, `docker-compose.yml`, `@sveltejs/adapter-node`).
- Starter templates: `user-auth`, `weather-api`, `note-crud`, `empty`, `blank`.
