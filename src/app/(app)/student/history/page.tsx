import Link from 'next/link'

import { requireStudent } from '@/lib/permissions'
import { getStudentHistoryData } from '@/lib/queries/student-history'

function formatSessionDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export default async function StudentHistoryPage() {
  const session = await requireStudent()
  const { sessions, summary, itemSummaries, assignmentProgress } = await getStudentHistoryData(session.user.id)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Practice history</h1>
          <p className="text-sm text-neutral-600">
            Review recent sessions, see what you worked on, and keep an eye on practice consistency.
          </p>
        </div>

        <Link
          href="/student/sessions/new"
          className="inline-flex items-center justify-center rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          Log a session
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Sessions in last 7 days</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{summary.sessionsLast7Days}</p>
          <p className="mt-2 text-sm text-neutral-600">
            {summary.activeDaysLast7Days} active day{summary.activeDaysLast7Days === 1 ? '' : 's'}
          </p>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Minutes in last 7 days</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{summary.totalMinutesLast7Days}</p>
          <p className="mt-2 text-sm text-neutral-600">Total logged time this week</p>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Minutes in last 30 days</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{summary.totalMinutesLast30Days}</p>
          <p className="mt-2 text-sm text-neutral-600">
            Across {summary.activeDaysLast30Days} active day{summary.activeDaysLast30Days === 1 ? '' : 's'}
          </p>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Current streak</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{summary.streakDays}</p>
          <p className="mt-2 text-sm text-neutral-600">
            Consecutive day{summary.streakDays === 1 ? '' : 's'} with practice
          </p>
        </section>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-4 py-3">
            <h2 className="text-lg font-semibold">Assignment follow-through</h2>
          </div>

          {assignmentProgress.length === 0 ? (
            <div className="px-4 py-6 text-sm text-neutral-600">No active assignments to track right now.</div>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {assignmentProgress.map((assignment) => (
                <li key={assignment.assignmentId} className="space-y-2 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-neutral-950">{assignment.title}</p>
                      <p className="text-sm text-neutral-600">From {assignment.teacherName}</p>
                    </div>
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs uppercase tracking-wide text-neutral-600">
                      {assignment.dueDate ? `Due ${formatDate(assignment.dueDate)}` : 'No due date'}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-600">
                    {assignment.practicedAssignedItems} of {assignment.totalAssignedItems} assigned item
                    {assignment.totalAssignedItems === 1 ? '' : 's'} practiced ({assignment.completionPercent}% coverage)
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-4 py-3">
            <h2 className="text-lg font-semibold">Most practiced items</h2>
          </div>

          {itemSummaries.length === 0 ? (
            <div className="px-4 py-6 text-sm text-neutral-600">No item trends yet.</div>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {itemSummaries.map((item) => (
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
        </div>
      </section>

      {sessions.length === 0 ? (
        <section className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">No sessions logged yet</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Once you log a practice session, you’ll see your notes, practiced items, and progress summaries here.
          </p>
          <div className="mt-5">
            <Link
              href="/student/sessions/new"
              className="inline-flex items-center justify-center rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Log your first session
            </Link>
          </div>
        </section>
      ) : (
        <div className="space-y-4">
          {sessions.map((practiceSession) => (
            <section
              key={practiceSession.id}
              className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-3 border-b border-neutral-200 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-950">{formatSessionDate(practiceSession.sessionDate)}</h2>
                  <p className="mt-1 text-sm text-neutral-600">
                    {practiceSession.durationMinutes
                      ? `${practiceSession.durationMinutes} minutes`
                      : 'Duration not set'}
                    {' · '}
                    {practiceSession.items.length} item{practiceSession.items.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 px-4 py-4">
                {practiceSession.notes ? (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-neutral-950">Session notes</h3>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-700">{practiceSession.notes}</p>
                  </div>
                ) : null}

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-neutral-950">Practiced items</h3>
                  <ul className="space-y-3">
                    {practiceSession.items.map((item) => (
                      <li key={item.id} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-medium text-neutral-950">{item.practiceItem.title}</p>
                          <p className="text-xs uppercase tracking-wide text-neutral-500">
                            {item.practiceItem.category}
                          </p>
                        </div>

                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                              Tempo reached
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">
                              {item.tempoReached || '—'}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                              Improvements
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">
                              {item.improvementNotes || '—'}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                              Weak spots
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">{item.weakSpots || '—'}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
