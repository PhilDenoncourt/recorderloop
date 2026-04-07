import Link from 'next/link'

import { createTeacherInviteCodeAction } from '@/app/(app)/teacher/students/actions'
import { requireTeacher } from '@/lib/permissions'
import { getTeacherStudentsPageData } from '@/lib/teacher-linking'

export default async function TeacherStudentsPage() {
  const session = await requireTeacher()
  const data = await getTeacherStudentsPageData(session.user.id)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Students</h1>
        <p className="text-sm text-neutral-600">
          Active student relationships and their most recent practice activity.
        </p>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-lg font-semibold text-neutral-950">Invite a student</h2>
            <p className="text-sm text-neutral-600">
              Generate a one-time invite code, then send that code to your student. They can enter it on <span className="font-medium text-neutral-900">/connect</span> while logged in.
            </p>
          </div>

          <form action={createTeacherInviteCodeAction}>
            <button
              type="submit"
              className="rounded-md border border-neutral-200 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Generate invite code
            </button>
          </form>
        </div>

        {data.pendingInvites.length > 0 ? (
          <div className="mt-5 space-y-3">
            <p className="text-sm font-medium text-neutral-900">Pending invite codes</p>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {data.pendingInvites.map((invite) => (
                <li key={invite.id} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Invite code</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[0.25em] text-neutral-950">{invite.inviteCode}</p>
                  <p className="mt-3 text-xs text-neutral-500">
                    Created {new Date(invite.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">No pending invite codes yet.</p>
        )}
      </section>

      {data.students.length === 0 ? (
        <section className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 shadow-sm">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-lg font-semibold text-neutral-950">No students linked yet</h2>
            <p className="text-sm text-neutral-600">
              Generate an invite code above and have your student redeem it at <span className="font-medium text-neutral-900">/connect</span>. Once they accept, their recent activity will show up here automatically.
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
                {data.students.reduce((total, { student }) => total + (student?.practiceSessions.length ?? 0), 0)}
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
                if (!student) {
                  return null
                }

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
                        <Link
                          href={`/teacher/students/${student.id}`}
                          className="mt-1 inline-block font-medium text-neutral-950 underline underline-offset-4"
                        >
                          Open protected review page
                        </Link>
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
