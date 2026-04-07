import Link from 'next/link'

import { requireTeacher } from '@/lib/permissions'

export default async function TeacherDashboardPage() {
  await requireTeacher()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Teacher dashboard</h1>
        <p className="text-sm text-neutral-600">
          Linked students, assignments, and review summaries will appear here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Students</h2>
          <p className="mt-2 text-sm text-neutral-600">
            View active student relationships and recent activity.
          </p>
          <p className="mt-4 text-sm">
            <Link className="font-medium text-neutral-900 underline underline-offset-4" href="/teacher/students">
              Open students
            </Link>
          </p>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Assignments</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Upcoming assignment creation and review flows will live here.
          </p>
          <p className="mt-4 text-sm">
            <Link className="font-medium text-neutral-900 underline underline-offset-4" href="/teacher/assignments">
              Open assignments
            </Link>
          </p>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Review your role and login details, or sign out from the shared shell.
          </p>
          <p className="mt-4 text-sm">
            <Link className="font-medium text-neutral-900 underline underline-offset-4" href="/teacher/account">
              Open account
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
