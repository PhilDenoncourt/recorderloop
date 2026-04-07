# RecorderLoop

RecorderLoop is a Next.js 15 app using Prisma, PostgreSQL, and Auth.js email sign-in.

## Local development

1. Copy `.env.example` to `.env`
2. Set the required environment variables
3. Install dependencies:
   ```bash
   npm install
   ```
4. Generate Prisma client:
   ```bash
   npm run db:generate
   ```
5. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
6. Seed local data:
   ```bash
   npm run db:seed
   ```
7. Start the app:
   ```bash
   npm run dev
   ```

## Render deployment

This repo includes a `render.yaml` blueprint for hosting on Render.

### Services
- **Web service:** Next.js app
- **Postgres database:** managed Render PostgreSQL

### Required environment variables
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `AUTH_TRUST_HOST=true`
- `AUTH_EMAIL_FROM`
- `RESEND_API_KEY`
- `NODE_ENV=production`

### Database schema
RecorderLoop expects to run in the PostgreSQL schema `recorderloop`.

Example:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=recorderloop"
```

If the schema does not exist yet, create it before migrations run:
```sql
CREATE SCHEMA IF NOT EXISTS recorderloop;
```

### Render notes
- Set `AUTH_URL` to your Render app URL, for example `https://recorderloop-web.onrender.com`
- Configure your Resend sender/domain so magic links can be delivered
- `npm run db:deploy` runs at startup to apply committed Prisma migrations
- For the first deploy, verify the database connection string uses `schema=recorderloop`

### Deploy flow
1. Push this repo to GitHub
2. In Render, create a Blueprint from the repo or create services manually
3. Fill in the unsynced env vars (`AUTH_URL`, `AUTH_EMAIL_FROM`, `RESEND_API_KEY`)
4. Confirm the Postgres connection string includes `?schema=recorderloop`
5. Deploy
