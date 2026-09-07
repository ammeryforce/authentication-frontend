# React authentication client

The client never reads the session cookie. It sends `credentials: "include"` to the API and restores state by calling `/api/me` when the app starts.

## Run

1. Copy `.env.example` to `.env`.
2. Run `npm install` and `npm run dev`.
3. Open the address printed by Vite (normally `http://localhost:5173`).

To test the initial administrator, sign in with `ADMIN_USER` and `ADMIN_PASS` from the backend `.env.local`.
