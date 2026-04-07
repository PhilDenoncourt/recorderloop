# RecorderLoop Initial Next.js + Auth.js + Prisma Wiring

This document defines the first application wiring layer needed after the schema is in place.

It is intentionally focused on the minimum viable setup for:
- Prisma client access
- Auth.js configuration
- session helpers
- route protection foundation
- role-aware redirects

---

## 1. Recommended Folder Layout

```text
src/
  app/
    api/
      auth/
        [...nextauth]/
          route.ts
    (public)/
      login/
        page.tsx
    (app)/
      onboarding/
        page.tsx
      student/
        page.tsx
      teacher/
        page.tsx
  lib/
    prisma.ts
    auth.ts
    session.ts
    permissions.ts
  types/
    auth.ts
prisma/
  schema.prisma
```

If you prefer not to use `src/`, the same structure can live at repo root.

---

## 2. Prisma Client Setup

### File
`src/lib/prisma.ts`

### Purpose
Prevent multiple PrismaClient instances during development hot reload and provide a single shared DB client.

### Recommended implementation

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 3. Auth.js Setup

### File
`src/lib/auth.ts`

### Purpose
Define Auth.js config, Prisma adapter, auth providers, callbacks, and session shaping.

### Recommended implementation shape

```ts
import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database',
  },
  providers: [
    Resend({
      from: process.env.AUTH_EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = user.role ?? null
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
```

### Notes
- `Resend` is just an example provider for magic links
- swap in another email provider if preferred
- the session callback exposes `id` and `role` to the app layer

---

## 4. Auth Route Handler

### File
`src/app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
```

This is the route Auth.js uses for auth flows.

---

## 5. Session Type Augmentation

### File
`src/types/auth.ts`

Use TypeScript module augmentation so `session.user.id` and `session.user.role` are correctly typed.

```ts
import { UserRole } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole | null
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
```

You may also want to augment the `User` type depending on usage.

---

## 6. Session Helper Utilities

### File
`src/lib/session.ts`

### Purpose
Create a small wrapper around `auth()` so page and server action code stays clean.

### Recommended implementation

```ts
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function getSession() {
  return auth()
}

export async function requireSession() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  return session
}
```

---

## 7. Permission Helpers

### File
`src/lib/permissions.ts`

### Purpose
Keep role and relationship checks out of page components.

### Recommended starter implementation

```ts
import { UserRole } from '@prisma/client'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'

export async function requireRole(role: UserRole) {
  const session = await requireSession()

  if (session.user.role !== role) {
    redirect('/onboarding')
  }

  return session
}

export async function requireStudent() {
  return requireRole(UserRole.STUDENT)
}

export async function requireTeacher() {
  return requireRole(UserRole.TEACHER)
}

export async function requireActiveTeacherStudentLink(
  teacherId: string,
  studentId: string,
) {
  const link = await prisma.teacherStudentLink.findUnique({
    where: {
      teacherId_studentId: {
        teacherId,
        studentId,
      },
    },
  })

  if (!link || link.status !== 'ACTIVE') {
    redirect('/teacher')
  }

  return link
}
```

### Note
If Prisma enum typing complains about `'ACTIVE'`, import and use `LinkStatus.ACTIVE` instead.

---

## 8. Onboarding Enforcement Pattern

### Goal
A newly authenticated user may not yet have a role.

That means:
- logged-in users without role should be routed to `/onboarding`
- role-gated routes should reject null role

### Suggested helper

```ts
import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/session'

export async function requireCompletedOnboarding() {
  const session = await requireSession()

  if (!session.user.role) {
    redirect('/onboarding')
  }

  return session
}
```

Then `requireStudent()` and `requireTeacher()` naturally sit on top of that model.

---

## 9. Login Page Shape

### File
`src/app/(public)/login/page.tsx`

For MVP, keep it simple:
- email input
- submit button
- explanation that a magic link will be sent

This page can use a server action or Auth.js sign-in call.

Pseudo-shape:

```tsx
export default function LoginPage() {
  return (
    <main>
      <h1>Sign in to RecorderLoop</h1>
      <form>
        <input type="email" name="email" required />
        <button type="submit">Email me a sign-in link</button>
      </form>
    </main>
  )
}
```

---

## 10. Onboarding Page Shape

### File
`src/app/(app)/onboarding/page.tsx`

Responsibilities:
- require session
- if user already has role, redirect to correct dashboard
- otherwise collect role and optional display name/timezone
- persist to `User.role` and `Profile`

Pseudo-flow:
1. load authenticated user
2. render role selection form
3. save role/profile
4. redirect to `/student` or `/teacher`

---

## 11. Student Dashboard Guard

### File
`src/app/(app)/student/page.tsx`

```ts
import { requireStudent } from '@/lib/permissions'

export default async function StudentDashboardPage() {
  await requireStudent()

  return <div>Student dashboard</div>
}
```

---

## 12. Teacher Dashboard Guard

### File
`src/app/(app)/teacher/page.tsx`

```ts
import { requireTeacher } from '@/lib/permissions'

export default async function TeacherDashboardPage() {
  await requireTeacher()

  return <div>Teacher dashboard</div>
}
```

---

## 13. Suggested Redirect Logic After Sign-In

After auth completes:
- if no role → `/onboarding`
- if role is `STUDENT` → `/student`
- if role is `TEACHER` → `/teacher`

You can implement this in:
- auth callback logic
- onboarding guard pages
- a shared post-login page

The simplest initial approach is:
- let users land in onboarding-aware route logic
- redirect from there based on role state

---

## 14. Environment Variables

Recommended initial environment variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=recorderloop"
AUTH_SECRET=
AUTH_URL=
AUTH_EMAIL_FROM=
RESEND_API_KEY=
```

If you are targeting a dedicated Postgres schema, create it before running Prisma migrations:

```sql
CREATE SCHEMA IF NOT EXISTS recorderloop;
```

Depending on Auth.js version and provider package, naming may vary slightly.

For Render production:
- set all secrets in Render dashboard
- ensure callback URL matches deployed app URL

---

## 15. First Install Set

Expected packages roughly include:

```bash
npm install next react react-dom
npm install @prisma/client prisma
npm install next-auth @auth/prisma-adapter
npm install zod
npm install tailwindcss
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
npm install resend
npm install -D typescript @types/node @types/react @types/react-dom
```

Exact list will vary depending on Next.js starter and UI setup.

---

## 16. First Wiring Milestones

### Milestone A
- Prisma client works
- Auth.js route mounted
- login page renders
- magic link delivery works

### Milestone B
- session callback exposes `user.id` and `user.role`
- onboarding page persists role
- dashboard redirects work

### Milestone C
- student and teacher dashboard shells are protected
- unauthorized access redirects correctly

After that, the app is ready for domain features.

---

## 17. Immediate Next Files After Wiring

Once this wiring exists, build these next:
- `lib/queries/student-dashboard.ts`
- `lib/queries/teacher-dashboard.ts`
- `app/(app)/onboarding/actions.ts`
- `app/(app)/student/practice-items/actions.ts`
- `app/(app)/student/sessions/actions.ts`
- Zod validators for all forms

That’s the point where RecorderLoop stops being infrastructure and starts becoming a product.
