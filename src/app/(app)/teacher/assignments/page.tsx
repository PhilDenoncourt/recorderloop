import Link from 'next/link'

import { AssignmentForm } from '@/app/(app)/teacher/assignments/assignment-form'
import { requireTeacher } from '@/lib/permissions'
import { getTeacherAssignmentsPageData } from '@/lib/queries/teacher-assignments'

function formatDate(date: Date | null) {
  if (!date) {
    return 'No due date'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export default async function TeacherAssignmentsPage() {
  const session = await requireTeacher()
  const data = await getTeacherAssignmentsPageData(session.user.id)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Assignments</h1>
        <p className="text-sm text-neutral-600">
          Create work for linked students and keep the current assignment list visible in one place.
        </p>
      </div>

      {data.students.length === 0 ? (
        <section className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-xl font-semibold text-neutral-950">No linked students yet</h2>
            <p className="text-sm text-neutral-600">
              You need at least one active teacher-student link before you can create assignments.
            </p>
            <div className="flex flex-wrap gap-3 pt-1 text-sm">
              <Link
                href="/teacher/students"
                className="rounded-md border border-neutral-200 bg-neutral-950 px-3 py-2 font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Open students
              </Link>
              <Link
                href="/teacher"
                className="rounded-md border border-neutral-200 bg-white px-3 py-2 font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-950"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-sm text-neutral-500">Linked students</p>
                <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.students.length}</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-sm text-neutral-500">Active assignments</p>
                <p className="mt-2 text-3xl font-semibold text-neutral-950">{data.assignments.length}</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-sm text-neutral-500">Students with item libraries</p>
                <p className="mt-2 text-3xl font-semibold text-neutral-950">
                  {data.students.filter((student) => student.practiceItems.length > 0).length}
                </p>
              </div>
            </section>

            <AssignmentForm students={data.students} />
          </div>

          <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3">
              <div>
                <h2 className="text-lg font-semibold">Current assignments</h2>
                <p className="text-sm text-neutral-500">What linked students should be working on right now.</p>
              </div>
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
                        <p className="text-sm text-neutral-600">{assignment.student.displayName}</p>
                      </div>
                      <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs uppercase tracking-wide text-neutral-600">
                        {formatDate(assignment.dueDate)}
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
                          {item.title}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
