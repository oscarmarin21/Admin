# Admin Backend

Express + TypeScript service powering the administrative project-management platform.

## Requirements

- Node.js >= 20
- pnpm (recommended) or npm

## Getting Started

```bash
pnpm install
pnpm dev
```

The application expects the environment variables defined in `env.example`. Copy the file to `.env` and adjust the values before running the service.

## Scripts

- `pnpm dev` — start the development server with file watching.
- `pnpm build` — compile TypeScript into the `dist/` directory.
- `pnpm start` — run the compiled JavaScript.
- `pnpm lint` — run ESLint checks.
- `pnpm test` — execute Jest test suite.

## Project Structure

```
src/
├── application/      # Use cases and service orchestration
├── config/           # Environment, logger, database helpers
├── di/               # Dependency injection container
├── domain/           # Entities, repositories, interfaces
├── infrastructure/   # Mongoose models, repository implementations, mailers
└── interfaces/       # HTTP controllers, routes, middlewares
```

## Testing

Tests live in `tests/` and use Jest + Supertest. Configure a dedicated MongoDB database for automated tests to avoid polluting production data.

## Deployment

- **Database:** MongoDB Atlas. Set `MONGODB_URI` to the cluster connection string.
- **Hosting:** Render/Fly.io (or any Node-friendly provider). Build with `pnpm build` and start with `pnpm start`.
- **SMTP:** For transactional mail in production, configure a provider such as Mailgun, SendGrid, or Amazon SES. For local testing use Mailtrap credentials.
- **JWT Keys:** Generate RSA keys or long random strings for `ACCESS_TOKEN_PRIVATE_KEY` and `REFRESH_TOKEN_PRIVATE_KEY`.

