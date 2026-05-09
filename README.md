# Love U 2 Full Stack Starter

`app + server` two-project setup:

- Frontend: Expo + React Native + Expo Router + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: SQLite + Prisma
- Package manager: pnpm

## 1. Prerequisites

PowerShell:

```powershell
corepack prepare pnpm@latest --activate
pnpm -v
```

## 2. Install Dependencies

From repository root:

```powershell
pnpm run install:all
```

Or install independently:

```powershell
pnpm --dir app install
pnpm --dir server install
```

## 3. Environment Variables

Frontend (`app/.env`):

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

Backend (`server/.env`):

```env
DATABASE_URL="file:./dev.db"
PORT=3001
```

## 4. Prisma Database

After dependencies are installed:

```powershell
pnpm --dir server prisma:generate
pnpm --dir server prisma:migrate
```

This creates `server/prisma/dev.db` and applies the initial `Todo` migration.

## 5. Run Development

From root:

```powershell
pnpm dev
```

This starts:

- backend: `http://localhost:3001`
- expo dev server in `app`

## 6. API Endpoints

- `GET /health` -> `{ status: "ok", timestamp: string }`
- `GET /api/todos` -> `Todo[]`
- `POST /api/todos` with `{ "title": "..." }`
- `PATCH /api/todos/:id` toggles `completed`

## 7. Lint

```powershell
pnpm --dir app lint
pnpm --dir server lint
```

## 8. Real Device Note

If testing on a physical phone, `localhost` usually points to the phone itself.
Set `EXPO_PUBLIC_API_URL` to your computer LAN IP, for example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.20:3001
```
