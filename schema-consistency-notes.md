# RecorderLoop Schema Consistency Notes

## Issues fixed

### 1. Prisma schema path mismatch
Originally:
- working schema file existed at project root as `schema.prisma`
- migration and seed docs assumed `prisma/schema.prisma`

Now:
- source of truth is `prisma/schema.prisma`
- root `schema.prisma` is only a temporary pointer file

### 2. Seed script depended on hard-coded primary keys
Originally:
- seed used fixed ids like `seed-long-tone-item`
- that worked, but created unnecessary coupling to primary-key shape

Now:
- seed finds or creates records by stable business meaning:
  - email for users
  - teacher/student pair for link
  - student + title for practice items
  - teacher + student + title for assignment
  - student + seed note marker for seed session

This is safer and closer to real app behavior.

### 3. Assignment seed idempotency
Originally:
- assignment could duplicate depending on repeated runs

Now:
- assignment is found-or-created by teacher/student/title
- assignment items use compound upsert

## Still worth reviewing next
- whether `PracticeItem` should have a uniqueness constraint like `@@unique([studentId, title])`
- whether `PracticeSessionItem` should prevent duplicate item rows per session
- exact Auth.js v5 adapter/provider typings once dependencies are installed
- whether to add middleware or keep route protection server-only for MVP
