import { redirect } from 'next/navigation'

import { OnboardingForm } from '@/app/(app)/onboarding/onboarding-form'
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
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md flex-col justify-center gap-6 px-6 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Welcome to RecorderLoop</h1>
        <p className="text-sm text-muted-foreground">
          Tell us whether you’re here as a student or teacher.
        </p>
      </div>

      <OnboardingForm
        defaultDisplayName={session.user.name ?? ''}
        timezone="America/New_York"
      />
    </div>
  )
}
