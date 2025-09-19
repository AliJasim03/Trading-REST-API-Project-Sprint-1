# Trading REST API — Sprint 1

## Overview
Minimal trading orders app (database + REST API + frontend) implementing fields:
`id`, `stockTicker`, `price`, `volume`, `buyOrSell`, `statusCode`.

## Steps

## DB
   - Ensure MySQL is running.
   - Run: `mysql -u root -p < db/create_database.sql`

## API
- `GET /api/orders` — get all orders
- `GET /api/orders/:id` — get an orders
- `POST /api/orders` — create orders, JSON: `{ stockTicker, price, volume, buyOrSell }`
- `PUT /api/orders/:id` — update orders (partial)
- `DELETE /api/orders/:id` — delete orders

## Notes
- No authentication (single-user)
