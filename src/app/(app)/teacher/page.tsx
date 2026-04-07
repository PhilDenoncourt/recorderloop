import { requireTeacher } from '@/lib/permissions'

export default async function TeacherDashboardPage() {
  await requireTeacher()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Teacher dashboard</h1>
        <p className="text-sm text-neutral-600">
          Linked students, assignments, and review summaries will appear here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Students</h2>
          <p className="mt-2 text-sm text-neutral-600">
            View active student relationships and recent activity.
          </p>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Assignments</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Upcoming assignment creation and review flows will live here.
          </p>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Sign out is available from the shared app shell on every authenticated page.
          </p>
        </section>
      </div>
    </div>
  )
}
