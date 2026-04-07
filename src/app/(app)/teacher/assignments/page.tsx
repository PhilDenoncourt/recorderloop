import { requireTeacher } from '@/lib/permissions'

export default async function TeacherAssignmentsPage() {
  await requireTeacher()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Assignments</h1>
        <p className="text-sm text-neutral-600">
          Assignment creation and review will live here next.
        </p>
      </div>

      <section className="rounded-xl border border-dashed border-neutral-300 bg-white px-5 py-6 text-sm text-neutral-600">
        Placeholder surface for upcoming teacher assignment workflows.
      </section>
    </div>
  )
}
