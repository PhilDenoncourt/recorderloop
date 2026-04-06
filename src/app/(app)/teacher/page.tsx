import { requireTeacher } from '@/lib/permissions'

export default async function TeacherDashboardPage() {
  await requireTeacher()

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Teacher dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Linked students, assignments, and review summaries will appear here.
      </p>
    </main>
  )
}
