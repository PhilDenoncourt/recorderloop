import Link from 'next/link'

import { requireTeacher } from '@/lib/permissions'
import { getTeacherDashboardData } from '@/lib/queries/teacher-dashboard'

function formatSessionDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export default async function TeacherDashboardPage() {
  const session = await requireTeacher()
  const data = await getTeacherDashboardData(session.user.id)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Teacher dashboard</h1>
          <p className="max-w-2xl text-sm text-neutral-600">
            Linked students, recent practice activity, and quick paths into review.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            className="rounded-md border border-neutral-200 bg-neutral-950 px-3 py-2 font-medium text-white transition-colors hover:bg-neutral-800"
            href="/teacher/students"
          >
            Open students
          </Link>
          <Link
            className="rounded-md border border-neutral-200 bg-white px-3 py-2 font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-950"
            href="/teacher/assignments"
          >
            Open assignments
          </Link>
        </div>
      </div>

      {data.students.length === 0 ? (
        <section className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-xl font-semibold text-neutral-950">No linked students yet</h2>
            <p className="text-sm text-neutral-600">
              Your dashboard comes to life once a student accepts an invite code. Generate one from the students page,
              then have them redeem it on <span className="font-medium text-neutral-900">/connect</span>.
            </p>
            <div className="flex flex-wrap gap-3 pt-1 text-sm">
              <Link
                href="/teacher/students"
                className="rounded-md border border-neutral-200 bg-neutral-950 px-3 py-2 font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Generate invite code
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
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-sm text-neutral-500">Active students</p>
              <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.summary.activeStudents}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-sm text-neutral-500">Students with recent activity</p>
              <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.summary.studentsWithRecentActivity}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-sm text-neutral-500">Recent sessions loaded</p>
              <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.summary.totalRecentSessions}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-sm text-neutral-500">Recent minutes</p>
              <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.summary.totalRecentMinutes}</p>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3">
                <div>
                  <h2 className="text-lg font-semibold">Linked students</h2>
                  <p className="text-sm text-neutral-500">A quick view of who is practicing and who needs attention.</p>
                </div>
                <Link
                  href="/teacher/students"
                  className="text-sm font-medium text-neutral-900 underline underline-offset-4"
                >
                  Manage students
                </Link>
              </div>

              <ul className="divide-y divide-neutral-200">
                {data.students.map(({ linkId, student, summary }) => {
                  const displayName = student.profile?.displayName || student.name || student.email

                  return (
                    <li key={linkId} className="space-y-4 px-4 py-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-950">{displayName}</p>
                          <p className="break-all text-sm text-neutral-600">{student.email}</p>
                        </div>

                        <Link
                          href={`/teacher/students/${student.id}`}
                          className="text-sm font-medium text-neutral-900 underline underline-offset-4"
                        >
                          Open review
                        </Link>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-lg bg-neutral-50 px-3 py-3">
                          <p className="text-xs uppercase tracking-wide text-neutral-500">Recent sessions</p>
                          <p className="mt-1 text-lg font-semibold text-neutral-950">{summary.recentSessions}</p>
                        </div>
                        <div className="rounded-lg bg-neutral-50 px-3 py-3">
                          <p className="text-xs uppercase tracking-wide text-neutral-500">Recent minutes</p>
                          <p className="mt-1 text-lg font-semibold text-neutral-950">{summary.totalRecentMinutes}</p>
                        </div>
                        <div className="rounded-lg bg-neutral-50 px-3 py-3">
                          <p className="text-xs uppercase tracking-wide text-neutral-500">Practice items</p>
                          <p className="mt-1 text-lg font-semibold text-neutral-950">{summary.activePracticeItems}</p>
                        </div>
                        <div className="rounded-lg bg-neutral-50 px-3 py-3">
                          <p className="text-xs uppercase tracking-wide text-neutral-500">Assignments</p>
                          <p className="mt-1 text-lg font-semibold text-neutral-950">{summary.activeAssignments}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                        <p className="text-neutral-600">
                          {summary.latestSession
                            ? `Last practiced ${formatSessionDate(summary.latestSession.sessionDate)}`
                            : 'No sessions logged yet'}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Link className="underline underline-offset-4" href="/teacher/students">
                            View all students
                          </Link>
                          <Link
                            className="underline underline-offset-4"
                            href={`/teacher/students/${student.id}`}
                          >
                            Review details
                          </Link>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="space-y-6">
              <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-200 px-4 py-3">
                  <h2 className="text-lg font-semibold">Recent activity</h2>
                </div>

                {data.activityFeed.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-neutral-600">
                    No recent sessions yet. Once students start logging practice, activity will show here.
                  </div>
                ) : (
                  <ul className="divide-y divide-neutral-200">
                    {data.activityFeed.map((activity) => (
                      <li key={activity.sessionId} className="space-y-2 px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-neutral-950">{activity.studentName}</p>
                            <p className="text-sm text-neutral-600">{formatSessionDate(activity.sessionDate)}</p>
                          </div>
                          <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs uppercase tracking-wide text-neutral-600">
                            {activity.loggedItems} item{activity.loggedItems === 1 ? '' : 's'}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600">
                          {activity.durationMinutes ? `${activity.durationMinutes} min logged` : 'Duration not set'}
                        </p>
                        <Link
                          href={`/teacher/students/${activity.studentId}`}
                          className="text-sm font-medium text-neutral-900 underline underline-offset-4"
                        >
                          Open student review
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-neutral-950">Quick links</h2>
                <div className="mt-4 flex flex-col gap-3 text-sm">
                  <Link className="underline underline-offset-4" href="/teacher/students">
                    Manage linked students and invite codes
                  </Link>
                  <Link className="underline underline-offset-4" href="/teacher/assignments">
                    Open assignments workspace
                  </Link>
                  <p className="text-neutral-500">
                    {data.summary.totalActiveAssignments > 0
                      ? `${data.summary.totalActiveAssignments} active assignment${data.summary.totalActiveAssignments === 1 ? '' : 's'} across linked students.`
                      : 'No active assignments yet.'}
                  </p>
                </div>
              </section>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
