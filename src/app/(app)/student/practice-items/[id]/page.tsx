import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  updatePracticeItem,
} from '@/app/(app)/student/practice-items/actions'
import { PracticeItemForm } from '@/app/(app)/student/practice-items/practice-item-form'
import { requireStudent } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export default async function StudentPracticeItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireStudent()
  const { id } = await params

  const practiceItem = await prisma.practiceItem.findFirst({
    where: {
      id,
      studentId: session.user.id,
    },
  })

  if (!practiceItem) {
    notFound()
  }

  const updateAction = updatePracticeItem.bind(null, practiceItem.id)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
          <Link href="/student" className="underline underline-offset-4">
            Student dashboard
          </Link>
          <span>→</span>
          <Link href="/student/practice-items" className="underline underline-offset-4">
            Practice items
          </Link>
          <span>→</span>
          <span>{practiceItem.title}</span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">{practiceItem.title}</h1>
        <p className="text-sm text-neutral-600">
          Edit details, mark the item active or inactive, and keep your practice list current.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <PracticeItemForm
          mode="edit"
          action={updateAction}
          initialValues={{
            title: practiceItem.title,
            category: practiceItem.category,
            notes: practiceItem.notes ?? '',
            isActive: practiceItem.isActive,
          }}
        />
      </div>
    </div>
  )
}
