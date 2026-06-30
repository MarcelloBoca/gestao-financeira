# Deployment Guide

## Recommended platform
- Vercel

## Required environment variables
- DATABASE_PROVIDER=postgresql
- DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require

## Build steps
1. Push the repository to GitHub.
2. Import the repo in Vercel.
3. Set the environment variable `DATABASE_URL` in Vercel project settings.
4. Deploy.

## Prisma notes
This project now uses PostgreSQL for production deployments.

Run locally before deployment:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

For production builds, the app will run:
```bash
prisma generate && prisma migrate deploy && next build
```
