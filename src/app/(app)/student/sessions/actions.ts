'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/permissions'

const practiceSessionItemSchema = z.object({
  practiceItemId: z.string().min(1),
  tempoReached: z.string().trim().max(100).optional().or(z.literal('')),
  improvementNotes: z.string().trim().max(1000).optional().or(z.literal('')),
  weakSpots: z.string().trim().max(1000).optional().or(z.literal('')),
})

const createPracticeSessionSchema = z.object({
  sessionDate: z.coerce.date(),
  durationMinutes: z.coerce.number().int().positive().max(1440).optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  items: z.array(practiceSessionItemSchema).min(1),
})

const formItemSchema = z.object({
  selected: z.boolean().optional(),
  practiceItemId: z.string().min(1),
  tempoReached: z.string().optional(),
  improvementNotes: z.string().optional(),
  weakSpots: z.string().optional(),
})

export type CreatePracticeSessionFormState = {
  ok: boolean
  error?: string
}

export async function createPracticeSession(input: {
  sessionDate: string
  durationMinutes?: number | null
  notes?: string
  items: Array<{
    practiceItemId: string
    tempoReached?: string
    improvementNotes?: string
    weakSpots?: string
  }>
}) {
  const session = await requireStudent()

  const parsed = createPracticeSessionSchema.safeParse(input)

  if (!parsed.success) {
    return {
      ok: false,
      error: 'Please include a valid session date and at least one practiced item.',
    }
  }

  const { sessionDate, durationMinutes, notes, items } = parsed.data

  const itemIds = [...new Set(items.map((item) => item.practiceItemId))]

  const ownedItems = await prisma.practiceItem.findMany({
    where: {
      id: { in: itemIds },
      studentId: session.user.id,
      isActive: true,
    },
    select: { id: true },
  })

  if (ownedItems.length !== itemIds.length) {
    return {
      ok: false,
      error: 'One or more selected practice items could not be used.',
    }
  }

  await prisma.practiceSession.create({
    data: {
      studentId: session.user.id,
      sessionDate,
      durationMinutes: durationMinutes ?? null,
      notes: notes || null,
      items: {
        create: items.map((item) => ({
          practiceItemId: item.practiceItemId,
          tempoReached: item.tempoReached || null,
          improvementNotes: item.improvementNotes || null,
          weakSpots: item.weakSpots || null,
        })),
      },
    },
  })

  revalidatePath('/student')
  revalidatePath('/student/sessions/new')

  return { ok: true }
}

export async function createPracticeSessionFromForm(
  _prevState: CreatePracticeSessionFormState,
  formData: FormData,
): Promise<CreatePracticeSessionFormState> {
  const rawItems = new Map<number, Record<string, FormDataEntryValue>>()

  for (const [key, value] of formData.entries()) {
    const match = key.match(/^items\.(\d+)\.(selected|practiceItemId|tempoReached|improvementNotes|weakSpots)$/)

    if (!match) {
      continue
    }

    const index = Number(match[1])
    const field = match[2]
    const item = rawItems.get(index) ?? {}

    item[field] = value
    rawItems.set(index, item)
  }

  const selectedItems = Array.from(rawItems.values())
    .map((item) =>
      formItemSchema.parse({
        selected: item.selected === 'true',
        practiceItemId: item.practiceItemId,
        tempoReached: typeof item.tempoReached === 'string' ? item.tempoReached : undefined,
        improvementNotes:
          typeof item.improvementNotes === 'string' ? item.improvementNotes : undefined,
        weakSpots: typeof item.weakSpots === 'string' ? item.weakSpots : undefined,
      }),
    )
    .filter((item) => item.selected)
    .map(({ practiceItemId, tempoReached, improvementNotes, weakSpots }) => ({
      practiceItemId,
      tempoReached,
      improvementNotes,
      weakSpots,
    }))

  const result = await createPracticeSession({
    sessionDate: String(formData.get('sessionDate') ?? ''),
    durationMinutes: formData.get('durationMinutes')
      ? Number(formData.get('durationMinutes'))
      : null,
    notes: String(formData.get('notes') ?? ''),
    items: selectedItems,
  })

  if (!result.ok) {
    return result
  }

  redirect('/student')
}
