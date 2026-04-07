'use server'

import { PracticeItemCategory } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/permissions'

const practiceItemSchema = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.nativeEnum(PracticeItemCategory),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
})

export type PracticeItemFormState = {
  ok: boolean
  error?: string
}

export async function createPracticeItem(
  _prevState: PracticeItemFormState,
  formData: FormData,
): Promise<PracticeItemFormState> {
  const session = await requireStudent()

  const parsed = practiceItemSchema.omit({ isActive: true }).safeParse({
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

  revalidateStudentPracticeViews()

  return { ok: true }
}

export async function updatePracticeItem(
  practiceItemId: string,
  _prevState: PracticeItemFormState,
  formData: FormData,
): Promise<PracticeItemFormState> {
  const session = await requireStudent()

  const parsed = practiceItemSchema.safeParse({
    title: formData.get('title'),
    category: formData.get('category'),
    notes: formData.get('notes'),
    isActive: formData.get('isActive') === 'on',
  })

  if (!parsed.success) {
    return {
      ok: false,
      error: 'Please enter a title and valid category.',
    }
  }

  const existingItem = await prisma.practiceItem.findFirst({
    where: {
      id: practiceItemId,
      studentId: session.user.id,
    },
    select: {
      id: true,
    },
  })

  if (!existingItem) {
    return {
      ok: false,
      error: 'Practice item not found.',
    }
  }

  const { title, category, notes, isActive } = parsed.data

  await prisma.practiceItem.update({
    where: {
      id: practiceItemId,
    },
    data: {
      title,
      category,
      notes: notes || null,
      isActive,
    },
  })

  revalidateStudentPracticeViews()
  redirect('/student/practice-items')
}

function revalidateStudentPracticeViews() {
  revalidatePath('/student')
  revalidatePath('/student/practice-items')
}
