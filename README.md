# Backend Auth Endpoints

This folder includes the new User model, authentication controllers, and routes.

## New files

- `models/User.ts` - Mongoose user model with `name`, `email`, `password` (hashed), and `role` ("admin" | "user").
- `controllers/userController.ts` - `signup` and `login` handlers. Returns a JWT token and user data on success.
- `routes/userRoutes.ts` - Exposes `/api/users/signup` and `/api/users/login`.

## Environment variables

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret used to sign JWTs (defaults to `change_this_secret` if not provided)
- `JWT_EXPIRES_IN` - JWT expiry (e.g. `7d`)

## Install new dependencies

From the `backend` folder run one of:

```powershell
npm install
# or with pnpm
pnpm install
```

## Quick test

Start the dev server:

```powershell
npm run start:dev
```

Signup:

POST /api/users/signup
Content-Type: application/json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123",
  "role": "user"
}

Login:

POST /api/users/login
Content-Type: application/json
{
  "email": "alice@example.com",
  "password": "secret123"
}

Both endpoints return JSON with `user` and `token` on success.
