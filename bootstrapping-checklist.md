# RecorderLoop Bootstrapping Checklist

Use this sequence to get a clean local/dev boot for RecorderLoop.

## 1. Prepare environment
- copy `.env.example` to `.env`
- set `DATABASE_URL`
- set `AUTH_SECRET`
- set `AUTH_URL`
- set `AUTH_EMAIL_FROM`
- set `RESEND_API_KEY`

## 2. Install dependencies
```bash
npm install
```

## 3. Confirm Prisma schema location
RecorderLoop’s Prisma source of truth is:
```text
prisma/schema.prisma
```

## 4. Generate Prisma client
```bash
npm run db:generate
```

## 5. Create initial migration
If you are using a dedicated Postgres schema, create it first if needed:
```sql
CREATE SCHEMA IF NOT EXISTS recorderloop;
```

Then run:
```bash
npx prisma migrate dev --name init
```

## 6. Seed dev data
```bash
npm run db:seed
```

## 7. Start app
```bash
npm run dev
```

## 8. Expected dev data after seed
- teacher user: `teacher@example.com`
- student user: `student@example.com`
- active teacher/student link
- two core practice items
- one active assignment
- one baseline practice session

## 9. Known early checks
Before calling the setup healthy, verify:
- Prisma client generates without schema errors
- initial migration SQL is created under `prisma/migrations/`
- seed runs repeatedly without duplicate assignment rows
- login route loads
- onboarding route loads
- `/student` and `/teacher` redirect behavior works once auth is connected

## 10. Recommended immediate cleanup after first boot
- wire login form to the server action fully
- pin exact Auth.js/provider compatibility if needed
- add first migration files to version control
- test seed against a fresh database reset
