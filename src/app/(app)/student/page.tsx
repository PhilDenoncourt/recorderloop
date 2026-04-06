import Link from 'next/link'

import { requireStudent } from '@/lib/permissions'
import { getStudentDashboardData } from '@/lib/queries/student-dashboard'

export default async function StudentDashboardPage() {
  const session = await requireStudent()
  const data = await getStudentDashboardData(session.user.id)

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Student dashboard</h1>
        <p className="text-sm text-neutral-600">
          Your practice items, active assignments, and recent sessions all in one place.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-neutral-500">Active practice items</p>
          <p className="mt-2 text-3xl font-semibold">{data.practiceItems.length}</p>
          <Link className="mt-4 inline-block text-sm underline" href="/student/practice-items">
            Manage practice items
          </Link>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-neutral-500">Active assignments</p>
          <p className="mt-2 text-3xl font-semibold">{data.assignments.length}</p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-neutral-500">Recent sessions</p>
          <p className="mt-2 text-3xl font-semibold">{data.recentSessions.length}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border">
          <div className="border-b px-4 py-3">
            <h2 className="text-lg font-semibold">Current practice items</h2>
          </div>

          {data.practiceItems.length === 0 ? (
            <div className="px-4 py-6 text-sm text-neutral-600">
              No practice items yet.
            </div>
          ) : (
            <ul className="divide-y">
              {data.practiceItems.map((item) => (
                <li key={item.id} className="px-4 py-3">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">{item.category}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border">
          <div className="border-b px-4 py-3">
            <h2 className="text-lg font-semibold">Recent sessions</h2>
          </div>

          {data.recentSessions.length === 0 ? (
            <div className="px-4 py-6 text-sm text-neutral-600">No sessions logged yet.</div>
          ) : (
            <ul className="divide-y">
              {data.recentSessions.map((sessionItem) => (
                <li key={sessionItem.id} className="px-4 py-3">
                  <p className="font-medium">
                    {new Date(sessionItem.sessionDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {sessionItem.durationMinutes ? `${sessionItem.durationMinutes} min` : 'Duration not set'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
