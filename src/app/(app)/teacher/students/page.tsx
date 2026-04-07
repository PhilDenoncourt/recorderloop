import Link from 'next/link'

import { requireTeacher } from '@/lib/permissions'
import { getTeacherDashboardData } from '@/lib/queries/teacher-dashboard'

export default async function TeacherStudentsPage() {
  const session = await requireTeacher()
  const data = await getTeacherDashboardData(session.user.id)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Students</h1>
        <p className="text-sm text-neutral-600">
          Active student relationships and their most recent practice activity.
        </p>
      </div>

      {data.students.length === 0 ? (
        <section className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 shadow-sm">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-lg font-semibold text-neutral-950">No students linked yet</h2>
            <p className="text-sm text-neutral-600">
              This page is ready for the teacher-student linking flow. Once students are connected,
              their recent activity and quick summaries will appear here.
            </p>
            <div className="flex flex-wrap gap-3 pt-1 text-sm">
              <Link
                href="/teacher"
                className="rounded-md border border-neutral-200 bg-neutral-950 px-3 py-2 font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Back to dashboard
              </Link>
              <Link
                href="/teacher/assignments"
                className="rounded-md border border-neutral-200 bg-white px-3 py-2 font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-950"
              >
                View assignments
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-sm text-neutral-500">Active students</p>
              <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.students.length}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-sm text-neutral-500">Recent sessions loaded</p>
              <p className="mt-2 text-3xl font-semibold text-neutral-950">
                {data.students.reduce((total, { student }) => total + student.practiceSessions.length, 0)}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-sm text-neutral-500">Next workflow</p>
              <p className="mt-2 text-base font-medium text-neutral-950">Student linking + review tools</p>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-4 py-3">
              <h2 className="text-lg font-semibold">Active students</h2>
            </div>

            <ul className="divide-y divide-neutral-200">
              {data.students.map(({ linkId, student }) => {
                const displayName = student.profile?.displayName || student.name || student.email
                const recentSessions = student.practiceSessions.length
                const latestSession = student.practiceSessions[0]

                return (
                  <li key={linkId} className="space-y-3 px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-950">{displayName}</p>
                        <p className="break-all text-sm text-neutral-600">{student.email}</p>
                      </div>

                      <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs uppercase tracking-wide text-neutral-600">
                        {recentSessions} recent session{recentSessions === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="grid gap-3 text-sm text-neutral-600 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-neutral-500">Last session</p>
                        <p className="mt-1 font-medium text-neutral-950">
                          {latestSession
                            ? new Date(latestSession.sessionDate).toLocaleDateString()
                            : 'No sessions yet'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-neutral-500">Status</p>
                        <p className="mt-1 font-medium text-neutral-950">Active relationship</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-neutral-500">Next</p>
                        <p className="mt-1 font-medium text-neutral-950">Assignment + review actions coming next</p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
