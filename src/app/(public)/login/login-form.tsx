'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import {
  requestMagicLink,
  type RequestMagicLinkState,
} from '@/app/(public)/login/actions'

const initialState: RequestMagicLinkState = {
  ok: false,
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      type="submit"
      disabled={pending}
    >
      {pending ? 'Sending sign-in link…' : 'Email me a sign-in link'}
    </button>
  )
}

export function LoginForm() {
  const [state, formAction] = useActionState(requestMagicLink, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <input
        className="w-full rounded-md border px-3 py-2"
        type="email"
        name="email"
        placeholder="you@example.com"
        required
      />

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  )
}
