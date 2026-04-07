'use client'

import { useActionState, useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { createAssignmentAction, type CreateAssignmentState } from '@/app/(app)/teacher/assignments/actions'

type StudentOption = {
  id: string
  displayName: string
  email: string
  practiceItems: Array<{
    id: string
    title: string
    category: string
    notes: string | null
  }>
}

type AssignmentFormProps = {
  students: StudentOption[]
}

const initialState: CreateAssignmentState = {
  ok: false,
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md border border-neutral-200 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Saving…' : 'Create assignment'}
    </button>
  )
}

export function AssignmentForm({ students }: AssignmentFormProps) {
  const [state, formAction] = useActionState(createAssignmentAction, initialState)
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id ?? '')

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? null,
    [selectedStudentId, students],
  )

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-950">Create assignment</h2>
          <p className="text-sm text-neutral-600">
            Choose a linked student, set the focus, and attach the practice items you want them to work on.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="studentId" className="block text-sm font-medium text-neutral-900">
            Student
          </label>
          <select
            id="studentId"
            name="studentId"
            value={selectedStudentId}
            onChange={(event) => setSelectedStudentId(event.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
            required
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.displayName} ({student.email})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-neutral-900">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Week of tone + rhythm focus"
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="dueDate" className="block text-sm font-medium text-neutral-900">
              Due date
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              className="w-full rounded-md border border-neutral-300 px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="focusAreas" className="block text-sm font-medium text-neutral-900">
              Focus areas
            </label>
            <input
              id="focusAreas"
              name="focusAreas"
              type="text"
              placeholder="Tone, even eighth notes, steady bow changes"
              className="w-full rounded-md border border-neutral-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium text-neutral-900">
            Teacher notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Anything you want the student to remember this week"
            className="min-h-28 w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-950">Assigned practice items</h2>
          <p className="text-sm text-neutral-600">
            Select one or more of the student&apos;s current active practice items.
          </p>
        </div>

        {!selectedStudent || selectedStudent.practiceItems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4 text-sm text-neutral-600">
            This student has no active practice items yet, so there&apos;s nothing to attach to an assignment.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedStudent.practiceItems.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-neutral-200 px-4 py-4"
              >
                <input
                  type="checkbox"
                  name="practiceItemIds"
                  value={item.id}
                  className="mt-1 h-4 w-4"
                />
                <div className="min-w-0">
                  <p className="font-medium text-neutral-950">{item.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">{item.category}</p>
                  {item.notes ? <p className="mt-2 text-sm text-neutral-600">{item.notes}</p> : null}
                </div>
              </label>
            ))}
          </div>
        )}
      </section>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {state.ok ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Assignment created.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton />
        <p className="text-sm text-neutral-500">Assignments require at least one linked practice item.</p>
      </div>
    </form>
  )
}
