'use server'

import { AssignmentStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireTeacher, requireActiveTeacherStudentLink } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

const createAssignmentSchema = z.object({
  studentId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  focusAreas: z.string().trim().max(1000).optional().or(z.literal('')),
  dueDate: z.string().trim().optional().or(z.literal('')),
  practiceItemIds: z.array(z.string().min(1)).min(1),
})

export type CreateAssignmentState = {
  ok: boolean
  error?: string
}

export async function createAssignmentAction(
  _prevState: CreateAssignmentState,
  formData: FormData,
): Promise<CreateAssignmentState> {
  const session = await requireTeacher()

  const parsed = createAssignmentSchema.safeParse({
    studentId: String(formData.get('studentId') ?? ''),
    title: String(formData.get('title') ?? ''),
    notes: String(formData.get('notes') ?? ''),
    focusAreas: String(formData.get('focusAreas') ?? ''),
    dueDate: String(formData.get('dueDate') ?? ''),
    practiceItemIds: formData.getAll('practiceItemIds').map((value) => String(value)),
  })

  if (!parsed.success) {
    return {
      ok: false,
      error: 'Please choose a linked student, enter a title, and select at least one practice item.',
    }
  }

  const { studentId, title, notes, focusAreas, dueDate, practiceItemIds } = parsed.data

  await requireActiveTeacherStudentLink(session.user.id, studentId)

  const ownedItems = await prisma.practiceItem.findMany({
    where: {
      id: {
        in: practiceItemIds,
      },
      studentId,
      isActive: true,
    },
    select: {
      id: true,
    },
  })

  const uniqueItemIds = [...new Set(practiceItemIds)]

  if (ownedItems.length !== uniqueItemIds.length) {
    return {
      ok: false,
      error: 'One or more selected practice items are invalid for that student.',
    }
  }

  await prisma.assignment.create({
    data: {
      teacherId: session.user.id,
      studentId,
      title,
      notes: notes || null,
      focusAreas: focusAreas || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: AssignmentStatus.ACTIVE,
      items: {
        create: uniqueItemIds.map((practiceItemId) => ({
          practiceItemId,
        })),
      },
    },
  })

  revalidatePath('/teacher')
  revalidatePath('/teacher/assignments')
  revalidatePath('/teacher/students')
  revalidatePath(`/teacher/students/${studentId}`)
  revalidatePath('/student')

  return {
    ok: true,
  }
}
