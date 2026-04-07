import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createPracticeSessionFromForm } from '@/app/(app)/student/sessions/actions'
import { SessionForm } from '@/app/(app)/student/sessions/session-form'
import { requireStudent } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export default async function NewStudentSessionPage() {
  const session = await requireStudent()

  const practiceItems = await prisma.practiceItem.findMany({
    where: {
      studentId: session.user.id,
      isActive: true,
    },
    orderBy: [
      {
        updatedAt: 'desc',
      },
      {
        title: 'asc',
      },
    ],
    select: {
      id: true,
      title: true,
      category: true,
      notes: true,
    },
  })

  if (practiceItems.length === 0) {
    redirect('/student/practice-items')
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
          <Link href="/student" className="underline underline-offset-4">
            Student dashboard
          </Link>
          <span>→</span>
          <span>New session</span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">Log a practice session</h1>
        <p className="text-sm text-neutral-600">
          Capture what you practiced today so you can spot progress and remember what to focus on next.
        </p>
      </div>

      <SessionForm practiceItems={practiceItems} createSessionAction={createPracticeSessionFromForm} />
    </div>
  )
}
