# RecorderLoop Technical Architecture

*Build-ready architecture for MVP*

## 1. Purpose
This document translates the RecorderLoop product spec into a build-ready technical architecture for MVP implementation.

RecorderLoop is a mobile-first web app for recorder students and teachers. The architecture is optimized for:
- fast MVP delivery
- simple operational overhead
- clean role-based access control
- low-friction practice logging on mobile
- room to expand later without overbuilding now

---

## 2. Chosen Stack

### Application
- **Framework:** Next.js
- **Language:** TypeScript
- **Rendering model:** server-first with selective client interactivity
- **UI:** Tailwind CSS + shadcn/ui

### Data and Persistence
- **Database:** PostgreSQL
- **ORM:** Prisma

### Authentication
- **Auth layer:** Auth.js
- **Session strategy:** database-backed sessions via Prisma adapter
- **Initial sign-in strategy:** magic link preferred; password login optional if later needed

### Hosting and Infrastructure
- **App hosting:** Render web service
- **Database hosting:** Render managed PostgreSQL
- **File storage:** none required for MVP
- **Email provider:** required for magic links (Resend, Postmark, or similar)

### Product Analytics / Monitoring
- **Initial MVP:** basic app logs + Render monitoring
- **Later:** PostHog or equivalent if retention instrumentation becomes necessary

---

## 3. Architecture Goals

### Primary goals
1. Keep the app simple enough to ship quickly
2. Centralize authorization logic on the server
3. Optimize the student practice logging flow for mobile speed
4. Support teacher review without building a full studio management system
5. Keep the schema relational and understandable

### Non-goals for MVP
- microservices
- event-driven architecture
- native mobile app
- realtime collaboration
- audio/video processing
- advanced analytics pipelines
- generalized multi-instrument abstraction

RecorderLoop should remain a single deployable application for v1.

---

## 4. System Overview

RecorderLoop will be implemented as a single Next.js application with:
- route-based pages for student and teacher experiences
- server-rendered dashboard and history pages
- server actions and/or route handlers for authenticated mutations
- Prisma for all data access
- Auth.js for login, session handling, and identity

### High-level flow
1. User visits app
2. Auth.js handles authentication and session creation
3. App resolves domain user role (`student` or `teacher`)
4. Server-rendered dashboard loads only authorized data
5. Mutations happen through server-side actions/handlers
6. Prisma enforces structured data access to PostgreSQL

---

## 5. Top-Level Architecture Diagram

```text
[ Browser / Mobile Web ]
          |
          v
[ Next.js App on Render ]
  - App Router
  - Server Components
  - Server Actions / Route Handlers
  - Auth.js
  - Authorization checks
          |
          v
[ Prisma ORM ]
          |
          v
[ Render PostgreSQL ]
```

Optional external dependency:

```text
[ Email Provider ]
  - magic link delivery
```

---

## 6. Application Structure

### App model
Use a single app with shared auth and role-aware route protection.

Avoid separate codebases for students and teachers. The domain is tightly related and operationally simpler as one product.

### Proposed project structure

```text
recorderloop/
  app/
    (public)/
      page.tsx
      login/
        page.tsx
      verify/
        page.tsx
    (app)/
      onboarding/
        page.tsx
      student/
        page.tsx
        practice-items/
          page.tsx
          new/
            page.tsx
          [itemId]/
            page.tsx
            edit/
              page.tsx
        sessions/
          new/
            page.tsx
          [sessionId]/
            page.tsx
        history/
          page.tsx
      teacher/
        page.tsx
        students/
          [studentId]/
            page.tsx
        assignments/
          new/
            page.tsx
          [assignmentId]/
            page.tsx
      connect/
        page.tsx
      settings/
        page.tsx
    api/
      auth/
        [...nextauth]/
          route.ts
  components/
    ui/
    auth/
    dashboard/
    practice/
    assignments/
    progress/
  lib/
    auth/
    db/
    permissions/
    queries/
    validators/
    utils/
  prisma/
    schema.prisma
  styles/
  public/
```

### Architectural conventions
- keep route-level data loading on the server by default
- keep mutations on the server
- keep authorization checks out of components and in dedicated domain helpers
- use form-driven UX where possible for simplicity and mobile speed

---

## 7. User Roles and Access Model

### Roles
- `student`
- `teacher`
- optional future: `admin`

For MVP, only `student` and `teacher` are required.

### Core access principles
- users can only access data they are authorized to see
- all authorization must be enforced server-side
- UI gating is convenience, not security

### Student permissions
A student can:
- view and edit their own profile
- create and manage their own practice items
- create practice sessions
- view their own history and progress
- view assignments attached to them
- view linked teachers

A student cannot:
- access another student’s sessions
- create assignments as a teacher
- browse arbitrary teacher data

### Teacher permissions
A teacher can:
- view their own teacher dashboard
- link with students
- create assignments for linked students
- review activity for linked students
- view student progress summaries for linked students

A teacher cannot:
- access unlinked students
- edit arbitrary student-owned records unless explicitly supported
- impersonate students

### Linking model
Teacher/student relationships are not global by role alone. They must exist through explicit links.

This avoids broad teacher access to all student data and keeps the domain privacy model clear.

---

## 8. Authentication Strategy

### Auth.js choice
Auth.js is used because it provides:
- secure session handling
- established auth flows
- Prisma adapter integration
- room for email magic links now and OAuth later

### Recommended initial auth setup
Use:
- **Email magic links** for MVP
- database-backed sessions
- Prisma adapter

This is a good fit because:
- it reduces password friction
- it lowers support overhead for account recovery
- it works well for teachers and students who may not want another password

### Optional future additions
- Google sign-in
- password-based login
- invitation-only flows for private pilots

### Session model
Use database sessions rather than JWT-only sessions for MVP.

Benefits:
- easier invalidation
- simpler operational control
- better alignment with Prisma-backed auth records

### Domain user ownership
Even though Auth.js handles authentication, the app should still own:
- role
- profile
- teacher/student links
- all business authorization

Authentication answers: “Who are you?”
Authorization answers: “What are you allowed to do here?”

Both remain distinct.

---

## 9. Data Model Overview

RecorderLoop is fundamentally a relational application with a clean set of entities:
- users
- teacher/student relationships
- practice items
- assignments
- practice sessions
- session item details

The MVP schema should remain normalized enough to query reliably, but not so fragmented that implementation slows down.

---

## 10. Core Entities

### User
Represents an authenticated person in the system.

**Fields**
- `id`
- `email`
- `name`
- `role`
- `createdAt`
- `updatedAt`

### Profile
Optional extended user information.

**Fields**
- `id`
- `userId`
- `displayName`
- `timezone`
- `instrumentLevel` (optional for students)
- `createdAt`
- `updatedAt`

### TeacherStudentLink
Represents an explicit relationship between a teacher and a student.

**Fields**
- `id`
- `teacherId`
- `studentId`
- `status` (`pending`, `active`, `archived`)
- `createdAt`
- `updatedAt`

### PracticeItem
A thing a student practices.

Examples:
- piece
- exercise
- scale
- fingering drill
- articulation study

**Fields**
- `id`
- `studentId`
- `createdByUserId`
- `title`
- `category`
- `notes`
- `isActive`
- `createdAt`
- `updatedAt`

### Assignment
A weekly or ad hoc assignment from a teacher to a student.

**Fields**
- `id`
- `teacherId`
- `studentId`
- `title`
- `notes`
- `focusAreas`
- `dueDate`
- `status`
- `createdAt`
- `updatedAt`

### AssignmentItem
Join entity between assignments and practice items.

**Fields**
- `id`
- `assignmentId`
- `practiceItemId`

### PracticeSession
A student practice event.

**Fields**
- `id`
- `studentId`
- `sessionDate`
- `durationMinutes`
- `notes`
- `createdAt`
- `updatedAt`

### PracticeSessionItem
Details of how a specific practice item showed up in a session.

**Fields**
- `id`
- `practiceSessionId`
- `practiceItemId`
- `tempoReached`
- `improvementNotes`
- `weakSpots`
- `confidenceRating` (optional future)
- `createdAt`
- `updatedAt`

This structure allows one session to include several practiced items with item-level notes.

---

## 11. Recommended Prisma Schema Shape

Below is a representative schema outline, not final generated code.

```prisma
enum UserRole {
  STUDENT
  TEACHER
}

enum LinkStatus {
  PENDING
  ACTIVE
  ARCHIVED
}

enum PracticeItemCategory {
  PIECE
  SCALE
  EXERCISE
  TECHNIQUE
  OTHER
}

enum AssignmentStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

model User {
  id                 String              @id @default(cuid())
  name               String?
  email              String              @unique
  emailVerified      DateTime?
  image              String?
  role               UserRole
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  profile            Profile?
  accounts           Account[]
  sessions           Session[]

  studentLinks       TeacherStudentLink[] @relation("StudentLinks")
  teacherLinks       TeacherStudentLink[] @relation("TeacherLinks")

  practiceItems      PracticeItem[]      @relation("StudentPracticeItems")
  createdItems       PracticeItem[]      @relation("CreatedPracticeItems")
  studentAssignments Assignment[]        @relation("StudentAssignments")
  teacherAssignments Assignment[]        @relation("TeacherAssignments")
  practiceSessions   PracticeSession[]
}

model Profile {
  id              String   @id @default(cuid())
  userId          String   @unique
  displayName     String?
  timezone        String?
  instrumentLevel String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model TeacherStudentLink {
  id         String     @id @default(cuid())
  teacherId  String
  studentId  String
  status     LinkStatus @default(PENDING)
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt

  teacher    User       @relation("TeacherLinks", fields: [teacherId], references: [id], onDelete: Cascade)
  student    User       @relation("StudentLinks", fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([teacherId, studentId])
}

model PracticeItem {
  id               String               @id @default(cuid())
  studentId        String
  createdByUserId  String
  title            String
  category         PracticeItemCategory @default(OTHER)
  notes            String?
  isActive         Boolean              @default(true)
  createdAt        DateTime             @default(now())
  updatedAt        DateTime             @updatedAt

  student          User                 @relation("StudentPracticeItems", fields: [studentId], references: [id], onDelete: Cascade)
  createdByUser    User                 @relation("CreatedPracticeItems", fields: [createdByUserId], references: [id], onDelete: Cascade)
  assignmentItems  AssignmentItem[]
  sessionItems     PracticeSessionItem[]
}

model Assignment {
  id           String            @id @default(cuid())
  teacherId    String
  studentId    String
  title        String
  notes        String?
  focusAreas   String?
  dueDate      DateTime?
  status       AssignmentStatus  @default(ACTIVE)
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  teacher      User              @relation("TeacherAssignments", fields: [teacherId], references: [id], onDelete: Cascade)
  student      User              @relation("StudentAssignments", fields: [studentId], references: [id], onDelete: Cascade)
  items        AssignmentItem[]
}

model AssignmentItem {
  id             String      @id @default(cuid())
  assignmentId   String
  practiceItemId String

  assignment     Assignment  @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  practiceItem   PracticeItem @relation(fields: [practiceItemId], references: [id], onDelete: Cascade)

  @@unique([assignmentId, practiceItemId])
}

model PracticeSession {
  id               String                @id @default(cuid())
  studentId        String
  sessionDate      DateTime
  durationMinutes  Int?
  notes            String?
  createdAt        DateTime              @default(now())
  updatedAt        DateTime              @updatedAt

  student          User                  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  items            PracticeSessionItem[]
}

model PracticeSessionItem {
  id                String          @id @default(cuid())
  practiceSessionId String
  practiceItemId    String
  tempoReached      String?
  improvementNotes  String?
  weakSpots         String?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  practiceSession   PracticeSession @relation(fields: [practiceSessionId], references: [id], onDelete: Cascade)
  practiceItem      PracticeItem    @relation(fields: [practiceItemId], references: [id], onDelete: Cascade)
}
```

### Auth.js models
The schema must also include Auth.js adapter tables:
- `Account`
- `Session`
- `VerificationToken`
- optionally `Authenticator` if needed later

Use the standard Prisma schema recommended by Auth.js and keep it close to upstream defaults.

---

## 12. Database Design Notes

### Why keep `role` on `User`
The app needs fast and explicit role checks during route access and mutations.

### Why keep `TeacherStudentLink`
Role alone is not enough to authorize access. A teacher must be linked to a student before seeing their activity.

### Why `PracticeSession` + `PracticeSessionItem`
A practice session often covers multiple items. This split keeps the session as the time container and item rows as the specific practice details.

### Why not separate `WeakSpot` table yet
For MVP, weak spots can remain text on `PracticeSessionItem`. That keeps logging friction low.

A normalized weak-spot model can be introduced later if trend analysis becomes important.

### Why not model lesson scheduling now
Lesson scheduling is out of scope for the wedge. Don’t blur the app into studio management too early.

---

## 13. Route Architecture

### Public routes
- `/` — marketing/landing page
- `/login` — sign-in/start auth flow
- `/verify` — email verification/magic link callback UI

### Authenticated shared routes
- `/onboarding` — choose role / finish profile / initial setup
- `/connect` — link teacher and student
- `/settings` — account/profile settings

### Student routes
- `/student` — dashboard
- `/student/practice-items` — list of items
- `/student/practice-items/new` — create item
- `/student/practice-items/[itemId]` — item detail
- `/student/practice-items/[itemId]/edit` — edit item
- `/student/sessions/new` — new practice session
- `/student/sessions/[sessionId]` — session detail
- `/student/history` — practice history and progress

### Teacher routes
- `/teacher` — dashboard
- `/teacher/students/[studentId]` — student overview/review page
- `/teacher/assignments/new` — create assignment
- `/teacher/assignments/[assignmentId]` — assignment detail

### Route protection rules
- all `(app)` routes require auth
- role-specific routes enforce role on server
- linked-student pages additionally enforce active teacher/student link

---

## 14. Data Fetching Strategy

### Default pattern
Use server components for:
- dashboards
- list pages
- detail pages
- history views

Use client components only for:
- highly interactive forms
- multi-select item pickers
- optimistic UX when genuinely helpful

### Why this pattern
It keeps:
- auth checks centralized
- data fetching simpler
- bundle sizes lower
- mobile performance better

### Query organization
Create dedicated query helpers in `lib/queries/`.

Examples:
- `getStudentDashboardData(userId)`
- `getTeacherDashboardData(userId)`
- `getStudentHistory(studentId)`
- `getTeacherStudentReview(teacherId, studentId)`

Do not bury business logic in page files.

---

## 15. Mutation Strategy

### Recommended approach
Use server actions for most authenticated form submissions.

Examples:
- create practice item
- update practice item
- create practice session
- create teacher/student link request
- accept link
- create assignment

Use route handlers only when:
- external callbacks are needed
- a more explicit API surface is required
- mobile/native clients are introduced later

### Why server actions for MVP
They reduce:
- boilerplate API code
- duplicate validation layers
- client-side complexity

But keep validation and permission checks in shared domain functions, not inline in page code.

---

## 16. Validation Layer

Use a schema validation library such as **Zod**.

### Validate all inbound mutation data
Examples:
- create practice item form
- create assignment form
- create session form
- onboarding role/profile form

### Validation principles
- validate shape before touching DB
- keep user-facing validation messages concise
- preserve low-friction form completion on mobile

---

## 17. Authorization Design

Authorization is a first-class part of the architecture.

### Recommended helper layer
Create domain helpers in `lib/permissions/`.

Examples:
- `requireAuth()`
- `requireRole(user, 'STUDENT')`
- `requireRole(user, 'TEACHER')`
- `requireLinkedTeacherStudent(teacherId, studentId)`
- `requireStudentOwnership(userId, studentId)`

### Example rule patterns
When creating a practice session:
- user must be authenticated
- user must be role `STUDENT`
- session `studentId` must equal authenticated user id

When viewing teacher review page:
- user must be authenticated
- user must be role `TEACHER`
- there must be an active teacher/student link

This should be enforced on every server-side entry point.

---

## 18. Dashboard Design at the Data Layer

### Student dashboard should show
- active assignments
- active practice items
- recent sessions
- a simple practice consistency summary

### Teacher dashboard should show
- linked students
- recent student activity
- assignments needing attention
- quick links into student review pages

### Query approach
Prefer small numbers of composed aggregate queries over chatty row-by-row fetching.

For MVP, optimize for readability first, then tune obvious bottlenecks.

---

## 19. Practice Logging Flow Design

This is the highest-risk retention flow and should be architected carefully.

### User experience goals
A student should be able to log a session in under 2 minutes.

### Required fields
- date
- practiced items

### Optional but valuable fields
- duration
- tempo reached
- weak spots
- improvement notes
- general notes

### Technical design principles
- support selecting multiple practice items in one session
- keep optional fields collapsible or secondary
- do not require excessive typing
- preserve input if form submission fails

### Architecture implication
The form should map naturally to:
- one `PracticeSession`
- many `PracticeSessionItem` rows

This is the core interaction shape of the product.

---

## 20. Teacher Assignment Flow Design

### Teacher assignment flow
1. teacher selects linked student
2. teacher creates assignment title and notes
3. teacher attaches one or more practice items
4. student sees assignment on dashboard

### Key modeling choice
Assignments should reference existing `PracticeItem` rows where possible.

This keeps practice structure anchored in the student’s item library and prevents data drift.

### Edge case
Teachers may want to assign a new item a student has not created yet.

For MVP, allow:
- teacher-created practice items owned by the student but attributed via `createdByUserId`

This is why `PracticeItem` includes both:
- `studentId`
- `createdByUserId`

---

## 21. Onboarding Flow

### Recommended onboarding sequence
1. user signs in via magic link
2. user lands on onboarding if role/profile incomplete
3. user selects `student` or `teacher`
4. profile basics are completed
5. dashboard destination is determined by role

### Optional teacher/student linking entry points
- invite link
- link code
- manual request/approval flow

### MVP recommendation
Start with a simple request/approval or code-based link flow.

Do not build a complicated invitation infrastructure unless pilot users demand it.

---

## 22. Linking Model Options

### Option A — Invite code
Teacher creates code, student enters code.

**Pros**
- simple mental model
- lightweight implementation

**Cons**
- some UX awkwardness

### Option B — Email invite
Teacher enters student email and invites them.

**Pros**
- smoother if email is central

**Cons**
- more invite flow logic
- more dependency on email behavior

### MVP recommendation
Use a **simple invite code or generated link**.

This fits the product’s small pilot phase and avoids unnecessary admin complexity.

---

## 23. Error Handling Strategy

### Principles
- never expose raw database errors to users
- return concise human-readable form feedback
- log enough detail server-side to debug failures

### Common error categories
- auth/session expired
- insufficient permissions
- invalid input
- linked relationship missing
- database write failure

### UX standard
For core forms:
- inline validation messages
- success confirmation on save
- redirect or refresh into updated state

---

## 24. Observability and Logging

### MVP observability
At minimum, capture:
- server errors
- auth failures
- failed mutations
- page load/server render failures

### Good enough tooling initially
- Render logs
- application-level structured console logging

### Later additions
- Sentry for error tracking
- PostHog for funnel and retention analysis

Don’t add these before the product loop itself exists.

---

## 25. Performance Considerations

MVP scale is likely small, so avoid premature optimization.

### Still important from day one
- keep pages server-rendered where sensible
- keep mobile payloads light
- avoid excessive client-side state libraries
- index core foreign keys in PostgreSQL
- paginate or limit long history queries

### Useful indexes
Add indexes on:
- `TeacherStudentLink.teacherId`
- `TeacherStudentLink.studentId`
- `PracticeItem.studentId`
- `Assignment.studentId`
- `Assignment.teacherId`
- `PracticeSession.studentId`
- `PracticeSession.sessionDate`
- `PracticeSessionItem.practiceSessionId`

Prisma can model these with `@@index`.

---

## 26. Security Considerations

### Core security baseline
- auth enforced via Auth.js
- server-side authorization checks everywhere
- secure session secret management in Render env vars
- CSRF/session protections inherited from Auth.js defaults
- no trust in client-submitted role or ownership identifiers

### Sensitive data profile
RecorderLoop MVP does not store highly sensitive medical or financial data, but it does store private practice history and teacher/student relationships.

Treat that data as private by default.

### Security anti-patterns to avoid
- role checks only in frontend
- trusting hidden form fields for ownership
- broad teacher access without relationship validation
- ad hoc auth logic duplicated across pages

---

## 27. Deployment Architecture on Render

### Services
1. **Render Web Service**
   - hosts Next.js app
   - handles SSR/server actions/route handlers

2. **Render PostgreSQL**
   - hosts application database

### Environment variables
At minimum:
- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL` or equivalent Auth.js app URL config
- email provider credentials for magic links
- `NODE_ENV`

### Build/deploy flow
- push to Git provider
- Render auto-builds app
- Prisma migrations run during deploy or via controlled release step
- app connects to managed Postgres

### Recommendation on migrations
Use explicit Prisma migrations committed to repo.

Avoid unmanaged schema drift.

---

## 28. Local Development Architecture

### Local stack
- Next.js dev server
- local Postgres or remote dev database
- Prisma migrations
- Auth.js configured with local callback URL
- local email dev strategy (console transport or dev inbox tool)

### Recommended commands
- install dependencies
- run Prisma migrate/dev
- run Next.js dev server
- test magic link flow in local/dev environment

Document exact scripts once repo scaffolding begins.

---

## 29. Testing Strategy

### MVP testing priorities
1. auth flow works
2. role routing works
3. student can create practice items
4. student can log session
5. teacher can link to student
6. teacher can create assignment
7. teacher can view linked student activity
8. unlinked access is blocked

### Test layers
- unit tests for permissions and validation helpers
- integration tests for server actions / DB interactions
- basic end-to-end tests for critical workflows

### Recommended early test focus
If time is limited, prioritize:
- authorization tests
- practice logging flow
- teacher/student linking flow

Those are the easiest places to create damaging bugs.

---

## 30. Suggested Build Phases

### Phase 1 — Foundation
- scaffold Next.js app
- configure Tailwind + shadcn/ui
- set up Prisma + PostgreSQL
- integrate Auth.js
- implement onboarding and role selection

**Exit condition:** user can sign in, choose role, and reach correct dashboard shell.

### Phase 2 — Student Core
- practice item CRUD
- student dashboard
- create practice session flow
- session history page

**Exit condition:** a student can independently use the app for real practice tracking.

### Phase 3 — Teacher Layer
- teacher/student linking
- teacher dashboard
- assignment creation
- student assignment visibility

**Exit condition:** a teacher can assign work and a student can act on it.

### Phase 4 — Review and Progress
- teacher review pages
- recent activity summaries
- simple consistency/progress indicators

**Exit condition:** teacher can review enough context before a lesson for product value to feel real.

### Phase 5 — Pilot Hardening
- bug fixes
- UI simplification
- analytics instrumentation if needed
- permission edge-case cleanup
- deploy polish on Render

**Exit condition:** product is stable enough for a small pilot.

---

## 31. Future Extension Paths

If MVP works, likely next layers include:
- recurring assignments
- reminder nudges
- richer progress summaries
- weak-spot trend analysis
- lesson prep summaries
- teacher comments on sessions
- student reflections
- media attachments
- multi-instrument generalization

These should only be added after the core practice loop proves sticky.

---

## 32. Deliberate Constraints

RecorderLoop should resist becoming too many things.

For v1, do **not** add:
- scheduling and billing
- video lessons
- audio analysis
- broad school administration
- generic LMS behavior
- social/community layers
- overengineered gamification

The wedge is continuity between lessons. Protect it.

---

## 33. Recommended Next Technical Artifacts

After this document, the next useful implementation artifacts are:
1. finalized Prisma schema
2. route-by-route screen inventory
3. database migration plan
4. server action/API contract list
5. initial repo scaffold
6. UI wireframes for student dashboard, session logging, and teacher review pages

---

## 34. Final Recommendation

RecorderLoop MVP should be built as a **single Next.js application** hosted on **Render**, using **Prisma + PostgreSQL** for structured relational data and **Auth.js** for secure authentication and sessions.

This architecture is the right size for the product:
- fast to build
- easy to reason about
- secure enough for private teacher/student workflows
- flexible enough to grow if the wedge proves real

The product’s success will not depend on technical novelty.
It will depend on whether logging practice and reviewing progress feels easy, fast, and useful.

That means the architecture should stay boring, clean, and focused.
