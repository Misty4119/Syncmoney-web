# Syncmoney Web Admin

A web administration interface for cross-server game currency synchronization. It provides a dashboard, audit logs, system status, plugin configuration, and user settings, with support for real-time events (SSE), internationalisation, and PWA.

---

## Features

| Feature | Description |
|---------|-------------|
| **Login** | Authentication via API Key; authenticated users may access all protected routes. |
| **Dashboard** | Total currency supply, player counts, today’s transactions, online players, circuit breaker status, and live connection status. |
| **Audit Log** | Transaction record search and filters (player, type, date range), pagination, and CSV/JSON export. |
| **System Status** | Plugin information, Redis/database/SSE connectivity, circuit breaker, economy mode, and server details. |
| **Plugin Config** | View current configuration sections (expandable/collapsible) and reload configuration. |
| **Settings** | Theme (dark/light), language (zh-TW/en-US), and timezone (local only). |
| **Live Notifications** | SSE stream for transactions, circuit breaker state changes, and system alerts, displayed as toasts. |

---

## Tech Stack

- **Framework:** Vue 3 (Composition API), Vue Router 5, Pinia
- **Build:** Vite 6, TypeScript 5.9
- **Styling:** Tailwind CSS 3, custom design system (CSS variables, glass, glow)
- **UI:** Reka UI, Vue Datepicker, Lucide Icons, Motion (animations)
- **i18n:** vue-i18n (zh-TW / en-US)
- **PWA:** vite-plugin-pwa (Workbox, manifest, offline caching)
- **Testing:** Vitest (unit), Playwright (E2E), MSW (API mocking)
- **HTTP:** Axios (interceptors: Bearer API Key, 401 logout)

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
    │   ├── client.ts       # Axios instance, Bearer auth, 401 handling
    │   └── types.ts        # ApiResponse, AuditRecord, SystemStatus, DashboardStats, Settings, AuthVerifyResponse
    ├── router/
    │   └── index.ts        # Route definitions, requiresAuth, login redirect
    ├── stores/
    │   ├── auth.ts         # API Key login, logout, checkAuth
    │   ├── settings.ts     # theme, locale, timezone; sync with backend
    │   └── notification.ts # Toast queue; transaction/breaker/system alerts
    ├── services/
    │   ├── configService.ts  # getConfig, reloadConfig
    │   ├── auditService.ts   # getAuditRecords, exportAuditCSV
    │   ├── economyService.ts # getDashboardStats
    │   └── systemService.ts  # getSystemStatus, getSystemMetrics
    ├── composables/
    │   ├── useWebSocket.ts   # SSE (EventSource), reconnect, on/off events
    │   ├── useSSE.ts         # Re-exports useWebSocket (SSE semantics)
    │   ├── useAudit.ts       # Audit search, pagination
    │   └── useSystem.ts      # System status, Redis, Breaker
    ├── i18n/
    │   ├── index.ts         # vue-i18n; locale from localStorage
    │   └── locales/
    │       ├── zh-TW.json
    │       └── en-US.json
    ├── styles/
    │   └── main.css         # Tailwind, design-system variables, utilities
    ├── components/
    │   ├── layout/
    │   │   ├── Layout.vue   # Sidebar + Header + NotificationArea; no layout on login
    │   │   ├── Sidebar.vue   # Navigation, collapse, logout
    │   │   ├── Header.vue
    │   │   └── NotificationArea.vue
    │   └── common/
    │       ├── Button.vue, Input.vue, Card.vue, Modal.vue
    │       ├── Table.vue, Pagination.vue, Badge.vue, StatusDot.vue
    │       ├── StatCard.vue, Skeleton.vue, EmptyState.vue
    │       └── NotificationToast.vue
    ├── views/
    │   ├── LoginView.vue
    │   ├── DashboardView.vue
    │   ├── AuditLogView.vue
    │   ├── SystemStatusView.vue
    │   ├── ConfigView.vue
    │   └── SettingsView.vue
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

- **Node.js:** 20 or later (recommended)
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

- Front-end requests use **relative paths** and are proxied by Vite’s `server.proxy`:
  - **`/api`** → `http://localhost:8080`
  - **`/ws`** → `ws://localhost:8080`
- The backend must expose REST APIs and SSE (or WebSocket) and accept `Authorization: Bearer <apiKey>`.
- **Login flow:** The app calls `/api/system/status` with the user-supplied API Key; on success it stores the key in `localStorage` and marks the user as authenticated.

---

## Routes and Auth

- **Public:** `/login`
- **Protected:** `/` (redirects to `/dashboard`), `/dashboard`, `/audit`, `/system`, `/settings`, `/config`
- Unauthenticated access to a protected route redirects to `/login`; authenticated access to `/login` redirects to `/dashboard`.

---

## Real-Time Events (SSE)

- The app connects to `/sse` via `EventSource` (optional `apiKey` query parameter). The logic lives in the `useWebSocket` composable; the public API is exposed as `useSSE`.
- Supported event types: `transaction`, `circuit_break`, `system_alert`, `connected`.
- Connection status is shown on the dashboard and system status page; events drive the notification store and are shown as toasts in the NotificationArea.

---

## Internationalisation (i18n)

- Locales: **zh-TW** (default), **en-US**.
- Language and theme can be synced with the backend (`/api/settings`, `/api/settings/theme`, `/api/settings/language`); timezone is stored locally only.

---

## PWA

- **vite-plugin-pwa** is used with `registerType: 'autoUpdate'`.
- Manifest: name “Syncmoney Web Admin”, short_name “Syncmoney”, theme_color, icons, and shortcuts (Dashboard, Audit Log, System Status).
- Workbox caches `**/*.{js,css,html,ico,png,svg,json}` and uses CacheFirst for Google Fonts.

---

## Testing

- **Unit tests:** Vitest; patterns `src/**/*.test.ts` and `src/**/*.spec.ts`; environment `happy-dom`; path alias `@` → `src`.
- **E2E:** Playwright; tests in `e2e/*.spec.ts`; default browser Chromium; baseURL `http://localhost:5173`; dev server started when required.
- **MSW:** In development, `main.ts` loads the worker from `mocks/browser.ts` (non-production only); handlers are in `src/mocks/handlers` (auth, audit, system, settings).

---

## Version

- The application version is taken from `package.json`’s `version` (currently 1.1.0) and injected via Vite’s `define.__APP_VERSION__`; it can be displayed on the login page and elsewhere.

---

## License and Notes

- This project is private; licensing is at the discretion of the project owner.
- If the backend runs on a port other than 8080, update `server.proxy` in `vite.config.ts`.
