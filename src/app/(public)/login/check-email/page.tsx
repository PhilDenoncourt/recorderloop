type CheckEmailPageProps = {
  searchParams?: Promise<{
    email?: string
  }>
}

export default async function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
  const params = searchParams ? await searchParams : undefined
  const email = params?.email

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a sign-in link{email ? ` to ${email}` : ''}. Open it on this device to continue.
        </p>
      </div>

      <div className="rounded-md border bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
        <p>If it doesn’t show up in a minute, check spam or promotions, then try again.</p>
        <p className="mt-2 text-neutral-600">
          If you’re testing a deployment and nothing arrives, verify Resend setup, sender verification, and auth environment variables.
        </p>
      </div>

      <a className="text-sm underline" href="/login">
        Back to sign in
      </a>
    </main>
  )
}
