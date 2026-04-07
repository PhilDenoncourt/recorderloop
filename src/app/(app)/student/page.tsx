import Link from 'next/link'

import { requireStudent } from '@/lib/permissions'
import { getStudentDashboardData } from '@/lib/queries/student-dashboard'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export default async function StudentDashboardPage() {
  const session = await requireStudent()
  const data = await getStudentDashboardData(session.user.id)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Student dashboard</h1>
        <p className="text-sm text-neutral-600">
          Your practice items, active assignments, and recent sessions all in one place.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-sm text-neutral-500">Teacher connection</p>
        <p className="mt-2 text-sm text-neutral-600">
          Need to link with a teacher? Use their invite code on the connect page.
        </p>
        <Link className="mt-4 inline-block text-sm underline underline-offset-4" href="/connect">
          Open connect page
        </Link>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Active practice items</p>
          <p className="mt-2 text-3xl font-semibold">{data.practiceItems.length}</p>
          <Link className="mt-4 inline-block text-sm underline underline-offset-4" href="/student/practice-items">
            Manage practice items
          </Link>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Active assignments</p>
          <p className="mt-2 text-3xl font-semibold">{data.assignments.length}</p>
          <p className="mt-3 text-sm text-neutral-600">
            Teacher-assigned work stays separate from your own practice list below.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Recent sessions</p>
          <p className="mt-2 text-3xl font-semibold">{data.recentSessions.length}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link className="underline underline-offset-4" href="/student/history">
              View history
            </Link>
            <Link className="underline underline-offset-4" href="/student/sessions/new">
              Log a session
            </Link>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Sessions in last 7 days</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.progressSummary.sessionsLast7Days}</p>
          <p className="mt-2 text-sm text-neutral-600">
            {data.progressSummary.activeDaysLast7Days} active day
            {data.progressSummary.activeDaysLast7Days === 1 ? '' : 's'} this week
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Minutes in last 7 days</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.progressSummary.totalMinutesLast7Days}</p>
          <p className="mt-2 text-sm text-neutral-600">Logged practice time this week</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Assignments with progress</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.progressSummary.assignmentsWithProgress}</p>
          <p className="mt-2 text-sm text-neutral-600">
            Out of {data.progressSummary.totalAssignmentsTracked} active assignment
            {data.progressSummary.totalAssignmentsTracked === 1 ? '' : 's'}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Most practiced items</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.itemTrends.length}</p>
          <p className="mt-2 text-sm text-neutral-600">Recent item trends ready to review</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold">Assigned work</h2>
            <p className="text-sm text-neutral-500">Current assignments from your teacher.</p>
          </div>
        </div>

        {data.assignments.length === 0 ? (
          <div className="px-4 py-6 text-sm text-neutral-600">
            No active assignments right now. Your self-managed practice items still appear below.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {data.assignments.map((assignment) => {
              const coverage = data.assignmentCoverage.find((item) => item.assignmentId === assignment.id)

              return (
                <li key={assignment.id} className="space-y-3 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-neutral-950">{assignment.title}</p>
                      <p className="text-sm text-neutral-600">
                        From {assignment.teacher.name || assignment.teacher.email}
                      </p>
                    </div>
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs uppercase tracking-wide text-neutral-600">
                      {assignment.dueDate ? `Due ${formatDate(assignment.dueDate)}` : 'No due date'}
                    </span>
                  </div>

                  {assignment.focusAreas ? (
                    <p className="text-sm text-neutral-600">
                      <span className="font-medium text-neutral-900">Focus:</span> {assignment.focusAreas}
                    </p>
                  ) : null}

                  {assignment.notes ? <p className="text-sm text-neutral-600">{assignment.notes}</p> : null}

                  {coverage ? (
                    <div className="rounded-lg bg-neutral-50 px-3 py-3 text-sm text-neutral-700">
                      <p className="font-medium text-neutral-900">Assignment follow-through</p>
                      <p className="mt-1">
                        {coverage.practicedAssignedItems} of {coverage.totalAssignedItems} assigned item
                        {coverage.totalAssignedItems === 1 ? '' : 's'} practiced recently ({coverage.completionPercent}% coverage)
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {coverage.latestMatchedSessionDate
                          ? `Last matched session ${formatDate(coverage.latestMatchedSessionDate)}`
                          : 'No matching practice session logged yet'}
                      </p>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
                    {assignment.items.map((assignmentItem) => (
                      <span key={assignmentItem.id} className="rounded-full bg-neutral-100 px-2.5 py-1">
                        {assignmentItem.practiceItem.title}
                      </span>
                    ))}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold">Recent item trends</h2>
            <p className="text-sm text-neutral-500">A lightweight view of what you’ve been spending time on lately.</p>
          </div>
        </div>

        {data.itemTrends.length === 0 ? (
          <div className="px-4 py-6 text-sm text-neutral-600">Log a few sessions to start seeing item trends.</div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {data.itemTrends.map((item) => (
              <li key={item.practiceItemId} className="space-y-2 px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-neutral-950">{item.title}</p>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">{item.category}</p>
                  </div>
                  <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs uppercase tracking-wide text-neutral-600">
                    {item.sessionsCount} session{item.sessionsCount === 1 ? '' : 's'}
                  </span>
                </div>

                <p className="text-sm text-neutral-600">Last practiced {formatDate(item.latestSessionDate)}</p>

                {item.latestImprovement ? (
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium text-neutral-900">Latest improvement:</span> {item.latestImprovement}
                  </p>
                ) : null}

                {item.latestWeakSpot ? (
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium text-neutral-900">Latest weak spot:</span> {item.latestWeakSpot}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3">
            <h2 className="text-lg font-semibold">Current practice items</h2>
            {data.practiceItems.length > 0 ? (
              <Link
                href="/student/sessions/new"
                className="text-sm font-medium text-neutral-900 underline underline-offset-4"
              >
                Quick log
              </Link>
            ) : null}
          </div>

          {data.practiceItems.length === 0 ? (
            <div className="px-4 py-6 text-sm text-neutral-600">No practice items yet.</div>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {data.practiceItems.map((item) => (
                <li key={item.id} className="px-4 py-3">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">{item.category}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3">
            <h2 className="text-lg font-semibold">Recent sessions</h2>
            <Link
              href="/student/history"
              className="text-sm font-medium text-neutral-900 underline underline-offset-4"
            >
              View history
            </Link>
          </div>

          {data.recentSessions.length === 0 ? (
            <div className="px-4 py-6 text-sm text-neutral-600">No sessions logged yet.</div>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {data.recentSessions.map((sessionItem) => (
                <li key={sessionItem.id} className="px-4 py-3">
                  <p className="font-medium">{new Date(sessionItem.sessionDate).toLocaleDateString()}</p>
                  <p className="text-sm text-neutral-600">
                    {sessionItem.durationMinutes ? `${sessionItem.durationMinutes} min` : 'Duration not set'}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {sessionItem.items.length} item{sessionItem.items.length === 1 ? '' : 's'} logged
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
