# CustomizeMyself Backend

NestJS API that powers measurements, garments, fit history, and snapshot presign flows for the CustomizeMyself MVP.

## Prerequisites

- Node.js ≥ 18
- PostgreSQL database (for Prisma models)
- Redis (optional; enables BullMQ queue processing)

## Environment Variables

Copy `.env.example` to `.env` and adjust the values:

```bash
cp backend/.env.example backend/.env
```

| Key                                          | Description                                               |
| -------------------------------------------- | --------------------------------------------------------- |
| `DATABASE_URL`                               | PostgreSQL connection string used by Prisma               |
| `S3_BUCKET`                                  | S3 bucket name for snapshot uploads                       |
| `S3_ENDPOINT`                                | S3 endpoint or CDN URL used for presign responses         |
| `S3_PRESIGN_TTL`                             | Presign TTL (seconds) returned by the snapshot stub       |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Placeholder credentials (not used in stub implementation) |
| `REDIS_URL`                                  | Redis connection string for BullMQ queues/workers         |

## Available Scripts

```bash
# install deps
npm install --workspace backend

# regenerate Prisma client
npm run --workspace backend prisma:generate

# run the dev server
npm run --workspace backend start:dev

# run lint, typecheck, and tests
npm run --workspace backend lint
npm run --workspace backend typecheck
npm run --workspace backend test

# launch BullMQ worker (requires Redis)
npm run --workspace backend worker:fit-history
```

## API Overview

| Method                        | Path                                       | Description |
| ----------------------------- | ------------------------------------------ | ----------- |
| `GET /api/garments`           | List garments                              |
| `POST /api/garments`          | Upsert garment metadata                    |
| `GET /api/measurements/:id`   | Fetch a measurement profile                |
| `POST /api/measurements`      | Create a measurement profile               |
| `GET /api/fit-history`        | List recent fit history entries            |
| `POST /api/fit-history`       | Record a new fit history entry             |
| `POST /api/snapshots/presign` | Stub presign response for snapshot uploads |
| `GET /api/queues/health`      | Report BullMQ queue availability           |

All routes respect the global prefix `api` (e.g., `http://localhost:3000/api/garments`).

## Notes

- Snapshot presign responses are currently stubbed. Integrate AWS SDK or S3-compatible client when credentials are available.
- BullMQ queues are disabled automatically if `REDIS_URL` is not set.
- Prisma models currently assume PostgreSQL; adjust `prisma/schema.prisma` for other providers.
