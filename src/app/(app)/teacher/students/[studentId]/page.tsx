import Link from 'next/link'

import { requireActiveTeacherStudentLink, requireTeacher } from '@/lib/permissions'
import { getTeacherStudentReviewData } from '@/lib/queries/teacher-student-review'

type TeacherStudentReviewPageProps = {
  params: Promise<{
    studentId: string
  }>
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
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
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{studentDisplayName}</h1>
          <p className="max-w-2xl text-sm text-neutral-600">
            Lesson-prep review for a linked student. This view surfaces recent sessions, repeated weak spots,
            assignment context, and item-level notes at a glance.
          </p>
          <p className="text-sm text-neutral-500">{data.student.email}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/teacher/assignments"
            className="rounded-md border border-neutral-200 bg-neutral-950 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Create assignment
          </Link>
          <Link
            href="/teacher/students"
            className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-950"
          >
            Back to students
          </Link>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Recent sessions</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.summary.recentSessions}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Recent minutes</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.summary.totalRecentMinutes}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Sessions with notes</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.summary.sessionsWithNotes}</p>
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

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-4 py-3">
              <h2 className="text-lg font-semibold">Recent practice sessions</h2>
            </div>

            {data.recentSessions.length === 0 ? (
              <div className="px-4 py-6 text-sm text-neutral-600">No sessions logged yet.</div>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {data.recentSessions.map((sessionItem) => (
                  <li key={sessionItem.id} className="space-y-4 px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-neutral-950">{formatDate(sessionItem.sessionDate)}</p>
                        <p className="text-sm text-neutral-600">
                          {sessionItem.durationMinutes ? `${sessionItem.durationMinutes} min` : 'Duration not set'}
                        </p>
                      </div>

                      <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs uppercase tracking-wide text-neutral-600">
                        {sessionItem.items.length} item{sessionItem.items.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {sessionItem.notes ? (
                      <p className="rounded-lg bg-neutral-50 px-3 py-3 text-sm text-neutral-700">{sessionItem.notes}</p>
                    ) : null}

                    <div className="space-y-3">
                      {sessionItem.items.map((item) => (
                        <div key={item.id} className="rounded-lg border border-neutral-200 p-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-neutral-950">{item.practiceItem.title}</p>
                              <p className="text-xs uppercase tracking-wide text-neutral-500">
                                {item.practiceItem.category}
                              </p>
                            </div>
                            {item.tempoReached ? (
                              <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
                                Tempo {item.tempoReached}
                              </span>
                            ) : null}
                          </div>

                          {(item.improvementNotes || item.weakSpots) ? (
                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              {item.improvementNotes ? (
                                <div className="rounded-md bg-green-50 px-3 py-3 text-sm text-green-900">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                                    Improvements
                                  </p>
                                  <p className="mt-1">{item.improvementNotes}</p>
                                </div>
                              ) : null}
                              {item.weakSpots ? (
                                <div className="rounded-md bg-amber-50 px-3 py-3 text-sm text-amber-900">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                                    Weak spots
                                  </p>
                                  <p className="mt-1">{item.weakSpots}</p>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-4 py-3">
              <h2 className="text-lg font-semibold">Assignment context</h2>
            </div>

            {data.assignments.length === 0 ? (
              <div className="px-4 py-6 text-sm text-neutral-600">No active assignments yet.</div>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {data.assignments.map((assignment) => (
                  <li key={assignment.id} className="space-y-3 px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-neutral-950">{assignment.title}</p>
                        <p className="text-sm text-neutral-600">
                          {assignment.dueDate ? `Due ${formatDate(assignment.dueDate)}` : 'No due date'}
                        </p>
                      </div>
                      <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs uppercase tracking-wide text-neutral-600">
                        {assignment.items.length} item{assignment.items.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {assignment.focusAreas ? (
                      <p className="text-sm text-neutral-600">
                        <span className="font-medium text-neutral-900">Focus:</span> {assignment.focusAreas}
                      </p>
                    ) : null}

                    {assignment.notes ? <p className="text-sm text-neutral-600">{assignment.notes}</p> : null}

                    <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
                      {assignment.items.map((item) => (
                        <span key={item.id} className="rounded-full bg-neutral-100 px-2.5 py-1">
                          {item.practiceItem.title}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-4 py-3">
              <h2 className="text-lg font-semibold">Repeated weak spots</h2>
            </div>

            {data.repeatedWeakSpots.length === 0 ? (
              <div className="px-4 py-6 text-sm text-neutral-600">
                No repeated weak spots yet. As patterns emerge across sessions, they&apos;ll show up here.
              </div>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {data.repeatedWeakSpots.map((spot) => (
                  <li key={`${spot.label}-${spot.latestDate.toISOString()}`} className="space-y-2 px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="font-medium text-neutral-950">{spot.label}</p>
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium uppercase tracking-wide text-amber-800">
                        {spot.count} mentions
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600">Seen in {spot.itemTitles.join(', ')}</p>
                    <p className="text-xs text-neutral-500">Latest mention {formatDate(spot.latestDate)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-4 py-3">
              <h2 className="text-lg font-semibold">Recent item-level notes</h2>
            </div>

            {data.itemInsights.length === 0 ? (
              <div className="px-4 py-6 text-sm text-neutral-600">No item-level notes yet.</div>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {data.itemInsights.slice(0, 8).map((insight) => (
                  <li
                    key={`${insight.sessionId}-${insight.practiceItemId}`}
                    className="space-y-2 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-neutral-950">{insight.practiceItemTitle}</p>
                        <p className="text-xs uppercase tracking-wide text-neutral-500">
                          {formatDate(insight.sessionDate)}
                        </p>
                      </div>
                      {insight.tempoReached ? (
                        <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
                          Tempo {insight.tempoReached}
                        </span>
                      ) : null}
                    </div>

                    {insight.improvementNotes ? (
                      <p className="text-sm text-neutral-600">
                        <span className="font-medium text-neutral-900">Improvement:</span> {insight.improvementNotes}
                      </p>
                    ) : null}

                    {insight.weakSpots ? (
                      <p className="text-sm text-neutral-600">
                        <span className="font-medium text-neutral-900">Weak spot:</span> {insight.weakSpots}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

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
        </div>
      </section>
    </div>
  )
}
