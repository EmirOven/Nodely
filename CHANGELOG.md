# Changelog

All notable changes to the Nodely project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
