import Link from 'next/link'

import { requireTeacher } from '@/lib/permissions'

const upcomingAssignmentCapabilities = [
  'Create assignments for linked students',
  'Set due dates and practice focus',
  'Review submission history in one place',
]

export default async function TeacherAssignmentsPage() {
  await requireTeacher()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Assignments</h1>
        <p className="text-sm text-neutral-600">
          Assignment creation and review will live here next.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">Assignment workspace coming next</h2>
          <p className="mt-3 text-sm text-neutral-600">
            The shell and navigation are now in place, so this page is ready for the first real
            teacher assignment workflow.
          </p>

          <ul className="mt-4 space-y-3 text-sm text-neutral-700">
            {upcomingAssignmentCapabilities.map((capability) => (
              <li key={capability} className="flex gap-3">
                <span className="mt-0.5 text-neutral-400">•</span>
                <span>{capability}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link
              href="/teacher/students"
              className="rounded-md border border-neutral-200 bg-neutral-950 px-3 py-2 font-medium text-white transition-colors hover:bg-neutral-800"
            >
              View students
            </Link>
            <Link
              href="/teacher"
              className="rounded-md border border-neutral-200 bg-white px-3 py-2 font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-950"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        <aside className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-950">Current status</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-neutral-500">Navigation</dt>
              <dd className="mt-1 font-medium text-neutral-950">Live in the shared app shell</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Destination</dt>
              <dd className="mt-1 font-medium text-neutral-950">Dedicated placeholder page is in place</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Next build target</dt>
              <dd className="mt-1 font-medium text-neutral-950">Create + review assignment flows</dd>
            </div>
          </dl>
        </aside>
      </section>
    </div>
  )
}
