'use server'

import { PracticeItemCategory } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/permissions'

const createPracticeItemSchema = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.nativeEnum(PracticeItemCategory),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
})

export type CreatePracticeItemState = {
  ok: boolean
  error?: string
}

export async function createPracticeItem(
  _prevState: CreatePracticeItemState,
  formData: FormData,
): Promise<CreatePracticeItemState> {
  const session = await requireStudent()

  const parsed = createPracticeItemSchema.safeParse({
    title: formData.get('title'),
    category: formData.get('category'),
    notes: formData.get('notes'),
  })

  if (!parsed.success) {
    return {
      ok: false,
      error: 'Please enter a title and valid category.',
    }
  }

  const { title, category, notes } = parsed.data

  await prisma.practiceItem.create({
    data: {
      studentId: session.user.id,
      createdByUserId: session.user.id,
      title,
      category,
      notes: notes || null,
    },
  })

  revalidatePath('/student')
  revalidatePath('/student/practice-items')

  return { ok: true }
}
