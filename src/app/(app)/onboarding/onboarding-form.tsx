'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import {
  completeOnboarding,
  type CompleteOnboardingState,
} from '@/app/(app)/onboarding/actions'

type OnboardingFormProps = {
  defaultDisplayName: string
  timezone: string
}

const initialState: CompleteOnboardingState = {
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
      {pending ? 'Saving…' : 'Continue'}
    </button>
  )
}

export function OnboardingForm({ defaultDisplayName, timezone }: OnboardingFormProps) {
  const [state, formAction] = useActionState(completeOnboarding, initialState)

  return (
    <form action={formAction} className="space-y-4">
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
          placeholder={defaultDisplayName || 'Your name'}
          defaultValue={defaultDisplayName}
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
          defaultValue={timezone}
        />
      </div>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  )
}
