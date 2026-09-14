# React authentication client

The client never reads the session cookie. It sends `credentials: "include"` to the API and restores state by calling `/api/me` when the app starts. The **Users** and **Audit log** navigation entries only render for an administrator session.

## Run

1. Copy `.env.example` to `.env`.
2. Run `npm install` and `npm run dev`.
3. Open the address printed by Vite (normally `http://localhost:5173`).

To test the initial administrator, sign in with `ADMIN_USER` and `ADMIN_PASS` from the backend `.env.local`.

## Features

- Authenticated users can create, read, edit, and delete item records.
- Administrators can list database users and change a selected user password.
- Administrators can see server-side audit records for item list, creation, update, and deletion events.
