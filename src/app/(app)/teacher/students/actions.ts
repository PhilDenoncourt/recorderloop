'use server'

import { revalidatePath } from 'next/cache'

import { requireTeacher } from '@/lib/permissions'
import { createUniqueTeacherInviteCode } from '@/lib/teacher-linking'
import { prisma } from '@/lib/prisma'

export async function createTeacherInviteCodeAction() {
  const session = await requireTeacher()
  const inviteCode = await createUniqueTeacherInviteCode()

  await prisma.teacherStudentLink.create({
    data: {
      teacherId: session.user.id,
      inviteCode,
    },
  })

  revalidatePath('/teacher')
  revalidatePath('/teacher/students')
}
