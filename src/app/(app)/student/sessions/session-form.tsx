'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

type PracticeItemOption = {
  id: string
  title: string
  category: string
  notes: string | null
}

type CreatePracticeSessionState = {
  ok: boolean
  error?: string
}

type SessionFormProps = {
  practiceItems: PracticeItemOption[]
  createSessionAction: (
    prevState: CreatePracticeSessionState,
    formData: FormData,
  ) => Promise<CreatePracticeSessionState>
}

const initialState: CreatePracticeSessionState = {
  ok: false,
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-black px-4 py-2 text-white transition-opacity disabled:opacity-60"
    >
      {pending ? 'Saving…' : 'Log session'}
    </button>
  )
}

export function SessionForm({ practiceItems, createSessionAction }: SessionFormProps) {
  const [state, formAction] = useActionState(createSessionAction, initialState)

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Session details</h2>
          <p className="text-sm text-neutral-600">
            Log what you practiced today, how long you worked, and anything worth remembering for your next session.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="sessionDate">
              Session date
            </label>
            <input
              id="sessionDate"
              name="sessionDate"
              type="date"
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="durationMinutes">
              Duration in minutes
            </label>
            <input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min="1"
              max="1440"
              inputMode="numeric"
              placeholder="45"
              className="w-full rounded-md border border-neutral-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="notes">
            Session notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="How did the session feel overall?"
            className="min-h-28 w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Practiced items</h2>
          <p className="text-sm text-neutral-600">
            Check each item you worked on and add optional notes for tempo, improvements, or weak spots.
          </p>
        </div>

        <div className="space-y-4">
          {practiceItems.map((item, index) => (
            <div key={item.id} className="rounded-lg border border-neutral-200 p-4">
              <div className="flex items-start gap-3">
                <input
                  id={`selected-${item.id}`}
                  name={`items.${index}.selected`}
                  type="checkbox"
                  value="true"
                  className="mt-1 h-4 w-4"
                />

                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <label htmlFor={`selected-${item.id}`} className="font-medium text-neutral-950">
                      {item.title}
                    </label>
                    <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">{item.category}</p>
                    {item.notes ? <p className="mt-2 text-sm text-neutral-600">{item.notes}</p> : null}
                  </div>

                  <input name={`items.${index}.practiceItemId`} type="hidden" value={item.id} />

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium" htmlFor={`tempoReached-${item.id}`}>
                        Tempo reached
                      </label>
                      <input
                        id={`tempoReached-${item.id}`}
                        name={`items.${index}.tempoReached`}
                        type="text"
                        placeholder="e.g. ♩ = 72"
                        className="w-full rounded-md border border-neutral-300 px-3 py-2"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-sm font-medium" htmlFor={`improvementNotes-${item.id}`}>
                        Improvements
                      </label>
                      <input
                        id={`improvementNotes-${item.id}`}
                        name={`items.${index}.improvementNotes`}
                        type="text"
                        placeholder="What got better today?"
                        className="w-full rounded-md border border-neutral-300 px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium" htmlFor={`weakSpots-${item.id}`}>
                      Weak spots
                    </label>
                    <textarea
                      id={`weakSpots-${item.id}`}
                      name={`items.${index}.weakSpots`}
                      rows={3}
                      placeholder="What still needs work?"
                      className="min-h-20 w-full rounded-md border border-neutral-300 px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {state.ok ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Practice session saved.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton />
        <p className="text-sm text-neutral-500">At least one practiced item is required.</p>
      </div>
    </form>
  )
}
