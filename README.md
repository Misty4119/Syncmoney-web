# Syncmoney Web Admin

A web administration interface for cross-server game currency synchronization. It provides a dashboard, audit logs, system status, plugin configuration, multi-node management, and user settings, with support for real-time events (SSE & WebSocket), internationalisation, and PWA.

---

## Features

| Feature | Description |
|---------|-------------|
| **Login** | Authentication via API Key; authenticated users may access all protected routes. |
| **Dashboard** | Total currency supply, player counts, today's transactions, online players, circuit breaker status, and live connection status. |
| **Central Dashboard** | Cross-server aggregated statistics, node status overview, and cross-server player leaderboards. |
| **Audit Log** | Transaction record search and filters (player, type, date range), virtual scrolling table, pagination, and CSV/JSON export. |
| **System Status** | Plugin information, Redis/database/SSE connectivity, circuit breaker, economy mode, and server details with auto-refresh every 10 seconds. |
| **Plugin Config** | View current configuration sections (expandable/collapsible), per-field editing, and reload configuration. |
| **Nodes Management** | Add, edit, and delete game server nodes with health checks, SSRF protection, and status monitoring. |
| **Settings** | Theme (dark/light), language (zh-TW/en-US), and timezone (synced with backend). |
| **Live Notifications** | SSE stream for transactions, circuit breaker state changes, system alerts, and player join/quit events, displayed as toasts. |

---

## Tech Stack

- **Framework:** Vue 3 (Composition API), Vue Router 5, Pinia (state management)
- **Build:** Vite 6, TypeScript 5.9
- **Styling:** Tailwind CSS 3, custom design system (CSS variables, glass, glow effects)
- **UI:** Reka UI, Vue Datepicker, Lucide Icons, Motion (animations)
- **i18n:** vue-i18n (zh-TW / en-US)
- **PWA:** vite-plugin-pwa (Workbox, manifest, offline caching)
- **Testing:** Vitest (unit), Playwright (E2E), MSW (API mocking)
- **HTTP:** Axios (interceptors: Bearer API Key, 401 logout, 403/429/500 error handling)
- **Real-time:** Server-Sent Events (SSE) + WebSocket with auto-reconnect (exponential backoff + jitter)

---

## Project Structure

```text
Syncmoney-web/
├── index.html
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts          # Vite + PWA, proxy /api & /ws, @ alias
├── tailwind.config.js      # Theme colours, animations, surface/glow
├── tsconfig.json
├── vitest.config.ts        # Unit tests (happy-dom, @ alias)
├── playwright.config.ts    # E2E (Chromium, baseURL 5173)
├── postcss.config.js
├── public/
│   ├── manifest.json
│   ├── version.json
│   ├── favicon.svg
│   ├── icons/              # PWA icons
│   └── mockServiceWorker.js # MSW worker (dev)
├── mocks/
│   └── browser.ts          # MSW worker entry; imports src/mocks/handlers
├── e2e/
│   ├── login.spec.ts
│   ├── dashboard.spec.ts
│   ├── audit.spec.ts
│   └── navigation.spec.ts
└── src/
    ├── main.ts             # createApp, Pinia, Router, i18n; mount after MSW
    ├── App.vue             # Layout + router-view, checkAuth
    ├── vite-env.d.ts
    ├── api/
    │   ├── client.ts       # Axios instance, Bearer auth, per-node baseURL, 401/403/429/500 handling
    │   └── types.ts        # ApiResponse, AuditRecord, SystemStatus, DashboardStats, Settings, SSE event types
    ├── router/
    │   └── index.ts        # Route definitions (9 routes), requiresAuth, login redirect
    ├── stores/
    │   ├── auth.ts         # API Key login, logout, checkAuth, token management
    │   ├── settings.ts     # theme, locale, timezone; sync with backend
    │   ├── notification.ts # Toast queue (transaction/breaker/system/player alerts)
    │   ├── nodes.ts        # Multi-node management, central mode, SSRF protection, health checks
    │   └── sse.ts          # SSE connection singleton with reference counting
    ├── services/
    │   ├── configService.ts  # getConfig, validateConfig, reloadConfig
    │   ├── auditService.ts   # getAuditRecords, exportAuditCSV/exportAuditJSON
    │   ├── economyService.ts # getDashboardStats
    │   └── systemService.ts  # getSystemStatus, getSystemMetrics, getNodeStatus, getCrossServerStats
    ├── composables/
    │   ├── useWebSocket.ts   # WebSocket (full-duplex), session token auth, auto-reconnect (exp backoff + jitter)
    │   ├── useSSE.ts         # SSE singleton (reference counted), event deduplication, auto-reconnect
    │   ├── useAudit.ts       # Audit search, pagination
    │   └── useSystem.ts      # System status, Redis check, Circuit Breaker check
    ├── i18n/
    │   ├── index.ts         # vue-i18n; locale from localStorage
    │   └── locales/
    │       ├── zh-TW.json
    │       └── en-US.json
    ├── styles/
    │   └── main.css         # Tailwind, design-system variables, utilities
    ├── types/
    │   ├── errors.ts        # AppError class, handleError utility
    │   └── events.ts        # SSE event type definitions (Transaction, PlayerJoin, CircuitBreak, etc.)
    ├── utils/
    │   ├── i18n.ts          # useI18nHelper wrapper
    │   └── timezone.ts      # Timezone string normalisation (UTC±N, IANA IDs, numeric offsets)
    ├── components/
    │   ├── layout/
    │   │   ├── Layout.vue   # Sidebar + Header + NotificationArea; no layout on login
    │   │   ├── Sidebar.vue   # Navigation, collapse, node selector, logout
    │   │   ├── Header.vue   # Theme toggle, notifications, language switcher
    │   │   └── NotificationArea.vue
    │   └── common/
    │       ├── Button.vue, Input.vue, Card.vue
    │       ├── Table.vue, Badge.vue, StatusDot.vue
    │       ├── StatCard.vue, Skeleton.vue, EmptyState.vue
    │       ├── NotificationToast.vue, Select.vue, Switch.vue
    │       └── NotificationPanel.vue
    ├── views/
    │   ├── LoginView.vue
    │   ├── DashboardView.vue        # Real-time dashboard with SSE events
    │   ├── AuditLogView.vue         # Virtual scrolling, filters, export
    │   ├── SystemStatusView.vue     # Auto-refresh, resource metrics
    │   ├── ConfigView.vue           # Expandable config sections, field editing
    │   ├── SettingsView.vue         # Theme, language, timezone
    │   ├── CentralDashboardView.vue # Cross-server stats, aggregated leaderboards
    │   ├── NodesManagementView.vue  # Node CRUD, health checks
    │   └── NotFoundView.vue
    └── mocks/
        ├── handlers/
        │   ├── index.ts     # Aggregates auth, audit, system, settings
        │   ├── auth.ts
        │   ├── audit.ts
        │   ├── system.ts
        │   └── settings.ts
        └── fixtures/
            └── audit.ts
```

---

## Requirements

- **Node.js:** 20 or later
- **Package manager:** pnpm (project uses `pnpm-lock.yaml`)

---

## Installation and Usage

```bash
# Install dependencies
pnpm install

# Development server (default http://localhost:5173; MSW enabled in dev)
pnpm run dev

# Type check
pnpm run typecheck

# Production build
pnpm run build

# Preview production build
pnpm run preview
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Start Vite dev server; register MSW in development. |
| `pnpm run build` | Run `vue-tsc --noEmit` then `vite build`. |
| `pnpm run preview` | Serve `dist` with a local static server. |
| `pnpm run typecheck` | Run `vue-tsc --noEmit` only. |
| `pnpm run test:unit` | Run Vitest unit tests. |
| `pnpm run test:e2e` | Run Playwright E2E tests (starts `pnpm run dev` when needed). |

---

## API and Proxy

- Front-end requests use **relative paths** and are proxied by Vite's `server.proxy`:
  - **`/api`** → `http://localhost:8080`
  - **`/ws`** → `ws://localhost:8080`
- The backend must expose REST APIs and SSE/WebSocket, and accept `Authorization: Bearer <apiKey>`.
- **Login flow:** The app calls `/api/system/status` with the user-supplied API Key; on success it stores the key in `localStorage` and marks the user as authenticated.
- **Node selection:** When a node is selected in the sidebar, all API requests target that node's base URL.

---

## Routes and Auth

| Route | View | Auth Required |
|-------|------|--------------|
| `/login` | LoginView | No (redirects to dashboard if already auth) |
| `/` | Redirects to `/dashboard` | - |
| `/dashboard` | DashboardView | Yes |
| `/audit` | AuditLogView | Yes |
| `/system` | SystemStatusView | Yes |
| `/settings` | SettingsView | Yes |
| `/config` | ConfigView | Yes |
| `/central` | CentralDashboardView | Yes |
| `/nodes` | NodesManagementView | Yes |
| `/*` | NotFoundView | No |

---

## Real-Time Events

### SSE (Server-Sent Events)

The app connects to `/sse` via `EventSource`. The logic lives in `useWebSocket` composable; the public API is exposed as `useSSE`.

**Supported event types:** `transaction`, `audit`, `circuit_break`, `system`, `system_alert`, `connected`, `authenticated`, `error`, `player_join`, `player_quit`.

**Features:**
- Singleton connection shared across all components (reference counted)
- Client-side event deduplication (based on `timestamp-playerName-amount`)
- Auto-reconnect with exponential backoff + jitter (base 3000ms, multiplier 1.5)

### WebSocket

Full-duplex WebSocket for interactive communication:
- Obtains session token via `/api/auth/ws-token`
- Auto-reconnect with exponential backoff + jitter (max 5 retries, max delay 30000ms)

---

## Internationalisation (i18n)

- Locales: **zh-TW** (default), **en-US**.
- Language, theme, and timezone are all synced with the backend (`/api/settings`).
- Timezone string normalisation supports UTC±N, IANA IDs (e.g. `Asia/Taipei`), and numeric offsets.

---

## PWA

- **vite-plugin-pwa** is used with `registerType: 'autoUpdate'`.
- Manifest: name "Syncmoney Web Admin", short_name "Syncmoney", theme_color, icons, and shortcuts (Dashboard, Audit Log, System Status).
- Workbox caches `**/*.{js,css,html,ico,png,svg,json}` and uses CacheFirst for Google Fonts.

---

## Testing

- **Unit tests:** Vitest; patterns `src/**/*.test.ts` and `src/**/*.spec.ts`; environment `happy-dom`; path alias `@` → `src`.
- **E2E:** Playwright; tests in `e2e/*.spec.ts`; default browser Chromium; baseURL `http://localhost:5173`; dev server started when required.
- **MSW:** In development, `main.ts` loads the worker from `mocks/browser.ts` (non-production only); handlers are in `src/mocks/handlers` (auth, audit, system, settings).

---

## Version

- The application version is taken from `package.json`'s `version` and injected via Vite's `define.__APP_VERSION__`; it can be displayed on the login page and elsewhere.

---

## License

- **License:** This project is licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0). See [LICENSE](LICENSE) for the full text. Copyright 2025-2026 Noie Linmimeng.
