# TravelSense Phase 1

Step 1 is complete: the login/signup UI is wired to the Express auth API and the server is using Prisma for the `User` table.

## Current Structure

- `client/` React UI for login and signup
- `server/` Express API with Prisma auth routes
- `login.html` original static login page used as the design reference

## Already Working

- Login/signup UI in React
- Password visibility toggle
- Signup password strength checks
- Login and signup requests to the backend
- JWT creation on successful login
- Prisma `User` schema
- Auth endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`

## Environment

Keep secrets in `server/.env` and do not commit them.

- `PORT=5000`
- `DATABASE_URL=...`
- `JWT_SECRET=...`
- `CLIENT_URL=http://localhost:5173` when developing locally

For the client, `client/.env` should point at the API:

- `VITE_API_BASE_URL=http://localhost:5000/api`
- `VITE_HOME_URL=/`

## How To Run

From `server/`:

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

From `client/`:

```bash
npm install
npm run dev
```

## Quick Check

If the backend is running, this should respond with JSON:

```bash
curl http://127.0.0.1:5000/health
```

If sign up still fails in the browser, the first things to check are:

- the server terminal is still running
- `client/.env` points to the correct API URL
- `server/.env` has the correct `DATABASE_URL` and `JWT_SECRET`
