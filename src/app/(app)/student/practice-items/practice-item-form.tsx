'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import {
  createPracticeItem,
  type PracticeItemFormState,
} from '@/app/(app)/student/practice-items/actions'
import type { PracticeItemCategory } from '@prisma/client'

type PracticeItemFormProps = {
  mode?: 'create' | 'edit'
  action?: (state: PracticeItemFormState, formData: FormData) => Promise<PracticeItemFormState>
  initialValues?: {
    title: string
    category: PracticeItemCategory
    notes: string
    isActive: boolean
  }
}

const initialState: PracticeItemFormState = {
  ok: false,
}

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus()

  return (
    <button
      className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      type="submit"
      disabled={pending}
    >
      {pending ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add practice item'}
    </button>
  )
}

export function PracticeItemForm({
  mode = 'create',
  action = createPracticeItem,
  initialValues,
}: PracticeItemFormProps) {
  const [state, formAction] = useActionState(action, initialState)

  return (
    <form action={formAction} className="space-y-4 rounded-lg border p-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {mode === 'edit' ? 'Edit practice item' : 'Add a practice item'}
        </h2>
        <p className="text-sm text-neutral-600">
          {mode === 'edit'
            ? 'Update the title, category, notes, or active status for this practice item.'
            : 'Create a piece, exercise, scale, or technique item for your practice list.'}
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
          defaultValue={initialValues?.title ?? ''}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="category">
          Category
        </label>
        <select
          className="w-full rounded-md border px-3 py-2"
          id="category"
          name="category"
          defaultValue={initialValues?.category ?? 'PIECE'}
          required
        >
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
          defaultValue={initialValues?.notes ?? ''}
        />
      </div>

      {mode === 'edit' ? (
        <label className="flex items-center gap-3 rounded-md border border-neutral-200 px-3 py-3">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={initialValues?.isActive ?? true}
          />
          <div>
            <p className="text-sm font-medium text-neutral-900">Active practice item</p>
            <p className="text-sm text-neutral-600">
              Inactive items stay in your history but won’t appear in new session logging.
            </p>
          </div>
        </label>
      ) : null}

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

      <SubmitButton mode={mode} />
    </form>
  )
}
