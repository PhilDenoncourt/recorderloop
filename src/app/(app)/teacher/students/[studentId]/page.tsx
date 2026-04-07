import Link from 'next/link'

import { requireActiveTeacherStudentLink, requireTeacher } from '@/lib/permissions'
import { getTeacherStudentReviewData } from '@/lib/queries/teacher-student-review'

type TeacherStudentReviewPageProps = {
  params: Promise<{
    studentId: string
  }>
}

export default async function TeacherStudentReviewPage({ params }: TeacherStudentReviewPageProps) {
  const session = await requireTeacher()
  const { studentId } = await params

  await requireActiveTeacherStudentLink(session.user.id, studentId)
  const data = await getTeacherStudentReviewData(studentId)

  if (!data.student) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Student review</h1>
          <p className="text-sm text-neutral-600">That student record could not be found.</p>
        </div>

        <Link
          href="/teacher/students"
          className="w-fit rounded-md border border-neutral-200 bg-neutral-950 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          Back to students
        </Link>
      </div>
    )
  }

  const studentDisplayName = data.student.profile?.displayName || data.student.name || data.student.email

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{studentDisplayName}</h1>
          <p className="text-sm text-neutral-600">
            Protected teacher review page. Only teachers with an active link can open this student overview.
          </p>
          <p className="text-sm text-neutral-500">{data.student.email}</p>
        </div>

        <Link
          href="/teacher/students"
          className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-950"
        >
          Back to students
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Recent sessions</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.summary.recentSessions}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Recent minutes</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.summary.totalRecentMinutes}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Active practice items</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.summary.activePracticeItems}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Active assignments</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.summary.activeAssignments}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-4 py-3">
            <h2 className="text-lg font-semibold">Recent practice sessions</h2>
          </div>

          {data.recentSessions.length === 0 ? (
            <div className="px-4 py-6 text-sm text-neutral-600">No sessions logged yet.</div>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {data.recentSessions.map((sessionItem) => (
                <li key={sessionItem.id} className="space-y-2 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-neutral-950">
                        {new Date(sessionItem.sessionDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {sessionItem.durationMinutes ? `${sessionItem.durationMinutes} min` : 'Duration not set'}
                      </p>
                    </div>

                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs uppercase tracking-wide text-neutral-600">
                      {sessionItem.items.length} item{sessionItem.items.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {sessionItem.notes ? <p className="text-sm text-neutral-600">{sessionItem.notes}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-4 py-3">
              <h2 className="text-lg font-semibold">Active practice items</h2>
            </div>

            {data.practiceItems.length === 0 ? (
              <div className="px-4 py-6 text-sm text-neutral-600">No active practice items yet.</div>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {data.practiceItems.map((item) => (
                  <li key={item.id} className="px-4 py-3">
                    <p className="font-medium text-neutral-950">{item.title}</p>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">{item.category}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-4 py-3">
              <h2 className="text-lg font-semibold">Active assignments</h2>
            </div>

            {data.assignments.length === 0 ? (
              <div className="px-4 py-6 text-sm text-neutral-600">No active assignments yet.</div>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {data.assignments.map((assignment) => (
                  <li key={assignment.id} className="px-4 py-3">
                    <p className="font-medium text-neutral-950">{assignment.title}</p>
                    <p className="text-sm text-neutral-600">
                      {assignment.items.length} practice item{assignment.items.length === 1 ? '' : 's'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
