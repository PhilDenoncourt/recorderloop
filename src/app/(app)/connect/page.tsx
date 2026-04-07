import { ConnectForm } from '@/app/(app)/connect/connect-form'
import { requireStudent } from '@/lib/permissions'

export default async function ConnectPage() {
  await requireStudent()

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Connect to a teacher</h1>
        <p className="text-sm text-neutral-600">
          Enter the invite code your teacher generated. Once accepted, they will appear in the teacher dashboard as an active student link.
        </p>
      </div>

      <ConnectForm />

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-950">How this works</h2>
        <ul className="mt-3 space-y-2 text-sm text-neutral-600">
          <li>• Your teacher creates a one-time invite code.</li>
          <li>• You enter the code here while signed in as a student.</li>
          <li>• RecorderLoop activates the teacher-student link immediately.</li>
        </ul>
      </section>
    </div>
  )
}
