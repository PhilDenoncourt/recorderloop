# RecorderLoop Initial Migration Plan

## Goal
Create the first database migration for RecorderLoop using Prisma, based on the MVP schema in `schema.prisma`.

This plan assumes:
- PostgreSQL
- Prisma migrations committed to the repo
- Auth.js with Prisma adapter
- fresh project setup with no existing production schema

---

## 1. Migration Strategy

Use a single initial migration to create:
- application enums
- application domain tables
- Auth.js tables
- indexes and unique constraints

Because this is a greenfield schema, the first migration should be a full baseline migration.

Recommended migration name:
- `init`

If you want slightly more descriptive naming:
- `init_auth_and_core_domain`

I’d personally use **`init`** for cleanliness.

---

## 2. Preconditions

Before generating the migration, the repo should have:
- `schema.prisma` in the Prisma directory
- `DATABASE_URL` configured for the dev database
- Prisma installed
- Postgres database available locally or remotely

Expected environment variable:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"
```

---

## 3. Commands to Create the First Migration

From the app root:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

This will:
- validate the schema
- generate Prisma Client
- create SQL migration files
- apply migration to the dev database
- update Prisma migration history

---

## 4. Expected Initial Schema Output

The first migration should create:

### Enums
- `UserRole`
- `LinkStatus`
- `PracticeItemCategory`
- `AssignmentStatus`

### Core tables
- `User`
- `Profile`
- `TeacherStudentLink`
- `PracticeItem`
- `Assignment`
- `AssignmentItem`
- `PracticeSession`
- `PracticeSessionItem`

### Auth.js tables
- `Account`
- `Session`
- `VerificationToken`

### Constraints
- unique email on `User`
- unique profile user relationship
- unique teacher/student pair
- unique assignment-item pair
- unique verification token
- composite Auth.js provider key

### Indexes
- teacher/student link indexes
- session history indexes
- assignment indexes
- practice item indexes
- auth/session support indexes

---

## 5. Review Checklist Before Committing Migration

Before committing the first migration, verify:

### Schema review
- `User.role` is nullable by design for onboarding
- all foreign keys use `onDelete: Cascade` only where intended
- Auth.js models match the version of Auth.js adapter being used
- `tempoReached` is intentionally `String?` rather than numeric
- `weakSpots` is intentionally denormalized text for MVP

### SQL review
Open the generated SQL and confirm:
- enum creation is correct
- FK constraints are present
- indexes were generated as expected
- naming is readable enough

### Product review
Confirm we are okay with:
- no admin role yet
- no invitation table yet
- no explicit audit trail yet
- no lesson scheduling tables

---

## 6. Suggested Seed Data for Dev

After initial migration, seed enough data to test both roles.

Recommended dev seed:
- 1 teacher user
- 1–2 student users
- 1 active teacher/student link
- 3–5 practice items
- 1 active assignment
- 2–3 practice sessions
- some item-level notes and tempo fields

This is enough to test:
- onboarding
- student dashboard
- teacher review page
- assignment visibility
- history queries

---

## 7. Seed Script Direction

Suggested future file:
- `prisma/seed.ts`

Seed should create:
1. teacher user
2. student user
3. profile rows
4. link row
5. practice items
6. assignment + assignment items
7. practice session + session item rows

Use deterministic emails for dev, such as:
- `teacher@example.com`
- `student@example.com`

---

## 8. Migration Safety Notes

Because this is the first migration:
- it should be treated as the baseline schema
- avoid editing generated SQL after the fact unless necessary
- if major schema changes happen before shared environments, it is okay to reset locally and regenerate

Once deployed beyond local/dev:
- prefer additive migrations
- avoid rebasing migration history

---

## 9. Production Deployment Migration Flow

For production on Render, recommended flow:

```bash
npx prisma migrate deploy
```

Do not use `migrate dev` in production.

Suggested deployment behavior:
- app build runs normally
- release command or deploy step runs `prisma migrate deploy`
- app starts only after migrations succeed

---

## 10. Recommended Repository Additions

To support migrations cleanly, add:
- `prisma/schema.prisma`
- `prisma/migrations/`
- `prisma/seed.ts`
- package scripts for migration/generate/seed

Suggested scripts:

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

---

## 11. Immediate Next Step After Migration

Once the first migration exists, next implementation work should be:
1. initialize Prisma client wiring
2. configure Auth.js with Prisma adapter
3. implement session helper utilities
4. add onboarding flow
5. create protected student/teacher dashboard shells

That gets the app from schema design into actual application skeleton.
