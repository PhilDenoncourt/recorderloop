import Link from 'next/link'

import { requireStudent } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

import { PracticeItemForm } from '@/app/(app)/student/practice-items/practice-item-form'

export default async function StudentPracticeItemsPage() {
  const session = await requireStudent()

  const practiceItems = await prisma.practiceItem.findMany({
    where: {
      studentId: session.user.id,
    },
    orderBy: [
      {
        isActive: 'desc',
      },
      {
        updatedAt: 'desc',
      },
    ],
  })

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Practice items</h1>
        <p className="text-sm text-neutral-600">
          Keep a focused list of the pieces, exercises, scales, and technique work you’re practicing.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <section className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-4 py-3">
              <h2 className="text-lg font-semibold">Your current list</h2>
            </div>

            {practiceItems.length === 0 ? (
              <div className="px-4 py-6 text-sm text-neutral-600">
                You don’t have any practice items yet. Add your first one to get started.
              </div>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {practiceItems.map((item) => (
                  <li key={item.id} className="space-y-2 px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium">
                          <Link
                            href={`/student/practice-items/${item.id}`}
                            className="underline underline-offset-4"
                          >
                            {item.title}
                          </Link>
                        </h3>
                        <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
                          {item.category}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          item.isActive
                            ? 'bg-green-50 text-green-700'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {item.notes ? <p className="text-sm text-neutral-700">{item.notes}</p> : null}

                    <div>
                      <Link
                        href={`/student/practice-items/${item.id}`}
                        className="text-sm font-medium underline underline-offset-4"
                      >
                        Edit item
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside>
          <PracticeItemForm />
        </aside>
      </div>
    </div>
  )
}
