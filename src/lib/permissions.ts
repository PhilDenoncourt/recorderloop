import { LinkStatus, UserRole } from '@prisma/client'
import { redirect } from 'next/navigation'

import { prisma } from '@/lib/prisma'
import { requireCompletedOnboarding } from '@/lib/session'

export async function requireRole(role: UserRole) {
  const session = await requireCompletedOnboarding()

  if (session.user.role !== role) {
    redirect(session.user.role === UserRole.TEACHER ? '/teacher' : '/student')
  }

  return session
}

export async function requireStudent() {
  return requireRole(UserRole.STUDENT)
}

export async function requireTeacher() {
  return requireRole(UserRole.TEACHER)
}

export async function requireActiveTeacherStudentLink(
  teacherId: string,
  studentId: string,
) {
  const link = await prisma.teacherStudentLink.findUnique({
    where: {
      teacherId_studentId: {
        teacherId,
        studentId,
      },
    },
  })

  if (!link || link.status !== LinkStatus.ACTIVE) {
    redirect('/teacher')
  }

  return link
}
