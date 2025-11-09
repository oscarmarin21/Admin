# Admin Platform Monorepo

This repository contains the backend and frontend applications for the administrative project-management platform.

## Structure

- `backend/` — Express + TypeScript API with MongoDB Atlas and JWT authentication.
- `frontend/` — React + Vite + Tailwind CSS web application with Flowbite React components.

## Getting Started

1. Install dependencies for both apps (pnpm recommended):

   ```bash
   cd backend && pnpm install
   cd ../frontend && pnpm install
   ```

2. Configure environment variables based on the `env.example` file in each app.

3. (Optional) Start a local MongoDB instance with Docker:

   ```bash
   docker-compose up -d mongo
   ```

4. Run the backend API:

   ```bash
   pnpm dev
   ```

5. Run the frontend app:

   ```bash
   pnpm dev
   ```

## Documentation

See `plan.md` for the full architecture blueprint and `backend/README.md`, `frontend/README.md` for service-specific instructions.

