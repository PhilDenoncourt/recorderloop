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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Sign in to RecorderLoop</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we’ll send you a magic link.
        </p>
      </div>

      <LoginForm />
    </main>
  )
}
