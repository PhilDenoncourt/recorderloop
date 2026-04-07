import { requireTeacher } from '@/lib/permissions'
import { getTeacherDashboardData } from '@/lib/queries/teacher-dashboard'

export default async function TeacherStudentsPage() {
  const session = await requireTeacher()
  const data = await getTeacherDashboardData(session.user.id)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Students</h1>
        <p className="text-sm text-neutral-600">
          Active student relationships and their most recent practice activity.
        </p>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-4 py-3">
          <h2 className="text-lg font-semibold">Active students</h2>
        </div>

        {data.students.length === 0 ? (
          <div className="px-4 py-6 text-sm text-neutral-600">
            No active students yet. This surface is ready for the linking flow next.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {data.students.map(({ linkId, student }) => (
              <li key={linkId} className="space-y-2 px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-neutral-950">
                      {student.profile?.displayName || student.name || student.email}
                    </p>
                    <p className="text-sm text-neutral-600">{student.email}</p>
                  </div>

                  <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs uppercase tracking-wide text-neutral-600">
                    {student.practiceSessions.length} recent sessions loaded
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
