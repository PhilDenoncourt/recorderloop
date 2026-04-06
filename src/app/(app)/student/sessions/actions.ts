'use server'

import { revalidatePath } from 'next/cache'
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
  revalidatePath('/student/history')

  return { ok: true }
}
