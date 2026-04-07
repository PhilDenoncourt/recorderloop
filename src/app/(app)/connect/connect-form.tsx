'use client'

import { useActionState } from 'react'

import { connectTeacherAction, type ConnectFormState } from '@/app/(app)/connect/actions'

const initialState: ConnectFormState = {}

export function ConnectForm() {
  const [state, formAction, pending] = useActionState(connectTeacherAction, initialState)

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="space-y-2">
        <label htmlFor="inviteCode" className="text-sm font-medium text-neutral-900">
          Teacher invite code
        </label>
        <input
          id="inviteCode"
          name="inviteCode"
          type="text"
          required
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          placeholder="ABCD2345"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm uppercase tracking-[0.2em] text-neutral-950 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900"
        />
        <p className="text-xs text-neutral-500">Ask your teacher for the 8-character code from their Students page.</p>
      </div>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-700">{state.success}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-neutral-200 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Connecting…' : 'Connect to teacher'}
      </button>
    </form>
  )
}
