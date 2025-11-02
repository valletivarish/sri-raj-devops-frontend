# Lost & Found Tracker – Frontend (React, Vite, JS)

A minimal, modern React frontend for the Lost & Found Tracker backend.

## Requirements
- Node 18+
- Backend running at `http://localhost:8080` (or set your own)

## Setup
```bash
cd frontend
npm install
# Create .env file with your configuration
npm run dev
```

Set in `.env`:
```env
# Backend API Base URL (required for production)
# Default: http://localhost:8080 (for development)
VITE_API_BASE_URL=http://localhost:8080

# Development Admin Credentials (optional, for dev mode)
VITE_DEV_ADMIN_EMAIL=admin@lostfound.com
VITE_DEV_ADMIN_PASSWORD=admin123
```

## Auth Flow
- Top-right has “Continue as Admin” and “Continue as Guest”.
- Admin opens a modal, fetches `/api/users`, allows choosing a user and attempts a login to obtain a JWT.
- Token is stored in memory only (React context) and never persisted.

## Pages
- `/` Home: list and filter items.
- `/items/:id` Item detail, report, edit/delete (when authenticated).
- `/create` Create new item with images (uploads to `/api/images/upload`).
- `/admin` Admin panel: reports list and user management (visible when token present).

## Notes
- No TypeScript is used anywhere.
- Theme avoids purple; variables defined in `src/styles/theme.css`.
- API base URL read from `VITE_API_BASE_URL`.


