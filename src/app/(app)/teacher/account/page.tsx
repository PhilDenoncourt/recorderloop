import { requireTeacher } from '@/lib/permissions'

export default async function TeacherAccountPage() {
  const session = await requireTeacher()

  const displayName = session.user.name ?? 'Not set yet'
  const email = session.user.email ?? 'No email available'

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-neutral-600">
          Your role and login details for RecorderLoop.
        </p>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-neutral-500">Name</dt>
            <dd className="mt-1 text-base text-neutral-950">{displayName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-neutral-500">Email</dt>
            <dd className="mt-1 break-all text-base text-neutral-950">{email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-neutral-500">Role</dt>
            <dd className="mt-1 text-base text-neutral-950">Teacher</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-neutral-500">Status</dt>
            <dd className="mt-1 text-base text-neutral-950">Ready for student and assignment workflows</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
