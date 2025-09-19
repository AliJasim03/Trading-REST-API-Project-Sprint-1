# Trading REST API — Sprint 1

## Overview
Minimal trading orders app (database + REST API + frontend) implementing the Sprint 1 spec fields:
`id`, `stockTicker`, `price`, `volume`, `buyOrSell`, `statusCode`. See brief. :contentReference[oaicite:1]{index=1}

## Steps

1. Create DB
   - Ensure MySQL is running.
   - Run: `mysql -u root -p < db/create_database.sql`

2. Backend
   - `cd backend`
   - Copy `.env.example` -> `.env` and edit DB credentials
   - `npm install`
   - `npm run dev`
   - Backend runs on `http://localhost:4000` by default.

3. Frontend
   - `cd frontend`
   - `npm install`
   - `npm start`
   - Frontend runs on `http://localhost:3000`

## API
- `GET /api/orders` — get all orders
- `GET /api/orders/:id` — get an orders
- `POST /api/orders` — create orders, JSON: `{ stockTicker, price, volume, buyOrSell }`
- `PUT /api/orders/:id` — update orders (partial)
- `DELETE /api/orders/:id` — delete orders

## Notes
- No authentication (single-user) as required by Sprint 1. :contentReference[oaicite:2]{index=2}
- `statusCode` default = 0 (Pending). Later Sprints can expand semantics.
