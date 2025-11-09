# Admin Frontend

React + Vite application for the administrative project-management platform.

## Requirements

- Node.js >= 20
- pnpm (recommended)

## Getting Started

```bash
pnpm install
pnpm dev
```

The app expects the backend API to be available at the URL configured via `VITE_API_BASE_URL` in an `.env` file created from `env.example`.

## Scripts

- `pnpm dev` — start the Vite dev server.
- `pnpm build` — build for production.
- `pnpm preview` — preview the production build.
- `pnpm lint` — run ESLint.
- `pnpm test` — run Vitest (unit/integration).

## Project Structure

```
src/
├── app/           # Root App component, routes, and providers
├── components/    # Reusable UI components
├── features/      # Feature-based modules (auth, dashboard, etc.)
├── hooks/         # Reusable hooks
├── i18n/          # Localization resources
├── lib/           # Instances (axios, query client, etc.)
└── styles/        # Tailwind entry point and global styles
```

## Testing

Configure Vitest and Testing Library for unit/component testing. End-to-end scaffolding (Playwright/Cypress) can be added under `tests/` when required.

## Deployment

- **Platform:** Vercel (recommended). Set `VITE_API_BASE_URL` to the deployed backend URL and `VITE_APP_NAME` as needed.
- **Build Command:** `pnpm build`
- **Output Directory:** `dist`
- **Env Vars:** Add `VITE_API_BASE_URL`, `VITE_APP_NAME`
- Ensure the backend is accessible over HTTPS with CORS allowed for the Vercel domain.

