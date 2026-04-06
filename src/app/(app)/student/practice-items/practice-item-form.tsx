'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import {
  createPracticeItem,
  type CreatePracticeItemState,
} from '@/app/(app)/student/practice-items/actions'

const initialState: CreatePracticeItemState = {
  ok: false,
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      type="submit"
      disabled={pending}
    >
      {pending ? 'Saving…' : 'Add practice item'}
    </button>
  )
}

export function PracticeItemForm() {
  const [state, formAction] = useActionState(createPracticeItem, initialState)

  return (
    <form action={formAction} className="space-y-4 rounded-lg border p-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Add a practice item</h2>
        <p className="text-sm text-neutral-600">
          Create a piece, exercise, scale, or technique item for your practice list.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="title">
          Title
        </label>
        <input
          className="w-full rounded-md border px-3 py-2"
          id="title"
          name="title"
          type="text"
          placeholder="Greensleeves"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="category">
          Category
        </label>
        <select className="w-full rounded-md border px-3 py-2" id="category" name="category" required>
          <option value="PIECE">Piece</option>
          <option value="SCALE">Scale</option>
          <option value="EXERCISE">Exercise</option>
          <option value="TECHNIQUE">Technique</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="notes">
          Notes
        </label>
        <textarea
          className="min-h-24 w-full rounded-md border px-3 py-2"
          id="notes"
          name="notes"
          placeholder="What should you focus on?"
        />
      </div>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {state.ok ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Practice item saved.
        </p>
      ) : null}

      <SubmitButton />
    </form>
  )
}
