import { redirect } from 'next/navigation'

import { LoginForm } from '@/app/(public)/login/login-form'
import { getSession } from '@/lib/session'

export default async function LoginPage() {
  const session = await getSession()

  if (session?.user?.role === 'STUDENT') {
    redirect('/student')
  }

  if (session?.user?.role === 'TEACHER') {
    redirect('/teacher')
  }

  if (session?.user?.id) {
    redirect('/onboarding')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Sign in to RecorderLoop</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we’ll send you a magic link.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm text-neutral-700">
        <p className="font-medium text-neutral-900">First time here?</p>
        <ul className="mt-2 space-y-1 pl-5 text-sm text-neutral-600">
          <li className="list-disc">Open the sign-in link from the same device if possible.</li>
          <li className="list-disc">After signing in, you’ll choose whether you’re a student or teacher.</li>
          <li className="list-disc">Students can connect to a teacher later with an invite code.</li>
        </ul>
      </div>

      <LoginForm />
    </main>
  )
}
