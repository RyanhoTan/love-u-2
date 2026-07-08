# Love U 2 Full Stack Starter

`app + server` two-project setup:

- Frontend: Expo + React Native + Expo Router + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: MySQL
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
MYSQL_URL="mysql://root:password@127.0.0.1:3306/love_u_2"
PORT=3001
```

## 4. Backend Status

The old Prisma + SQLite backend has been cleared.
`server` is now a clean Express + TypeScript scaffold prepared for a `mysql2` rebuild.

Current API behavior:

- `GET /health` returns basic service status
- `GET|POST|PATCH /api/auth/*` currently returns `501`
- `GET|POST|PATCH /api/todos/*` currently returns `501`

## 5. Run Development

From root:

```powershell
pnpm dev
```

This starts:

- backend: `http://localhost:3001`
- expo dev server in `app`

## 6. Next Backend Steps

Recommended rebuild order:

- create MySQL tables
- add `src/db.ts` query helpers
- rebuild auth routes
- rebuild business modules such as todos / couple space / wishes

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
