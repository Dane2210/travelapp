# Travel App

A mobile-first travel planning app that helps users discover affordable travel options by organizing flight, hotel, and activity deals in one place. Users can track prices, estimate full trip costs, and contribute to a travel community by sharing posts and ratings.

## Tech Stack
- React (Vite) client
- Express API (Node)
- Supabase (Auth, Postgres, Storage, Realtime)

## Directory Structure
```
/client       # React front end (Vite)
/api          # Express API (Node)
/supabase     # SQL migrations + seeds
/docs         # PRD, user stories, site map, deployment notes
README.md
```

## Local Development

### Prerequisites
- Node.js (LTS recommended)

### Client (Vite + React)
```
cd client
npm install
npm run dev
```
Dev server runs on http://localhost:5173 by default.

### API (Express)
```
cd api
npm install
npm run dev
```
API runs on http://localhost:4000 by default.

### Environment Variables
Create env files for Supabase (do not commit secrets):

Client (`/client/.env.local`):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

API (`/api/.env`):
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Scripts
- client: `npm run dev`, `npm run build`, `npm run preview`
- api: `npm run dev`, `npm start`

## Notes
- .gitignore includes: node_modules/, .env, .DS_Store, build/, dist/
- You can expand docs under `/docs` for PRD, user stories, and deployment notes.
