import { redirect } from 'next/navigation'

import { completeOnboarding } from '@/app/(app)/onboarding/actions'
import { requireSession } from '@/lib/session'

export default async function OnboardingPage() {
  const session = await requireSession()

  if (session.user.role === 'STUDENT') {
    redirect('/student')
  }

  if (session.user.role === 'TEACHER') {
    redirect('/teacher')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Welcome to RecorderLoop</h1>
        <p className="text-sm text-muted-foreground">
          Tell us whether you’re here as a student or teacher.
        </p>
      </div>

      <form action={completeOnboarding} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="role">
            Role
          </label>
          <select className="w-full rounded-md border px-3 py-2" id="role" name="role" required>
            <option value="">Select a role</option>
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="displayName">
            Display name
          </label>
          <input
            className="w-full rounded-md border px-3 py-2"
            id="displayName"
            name="displayName"
            type="text"
            placeholder={session.user.name ?? 'Your name'}
            defaultValue={session.user.name ?? ''}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="timezone">
            Timezone
          </label>
          <input
            className="w-full rounded-md border px-3 py-2"
            id="timezone"
            name="timezone"
            type="text"
            placeholder="America/New_York"
            defaultValue="America/New_York"
          />
        </div>

        <button className="w-full rounded-md bg-black px-4 py-2 text-white" type="submit">
          Continue
        </button>
      </form>
    </main>
  )
}
