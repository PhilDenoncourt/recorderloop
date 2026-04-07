import { LinkStatus } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export async function getTeacherAssignmentsPageData(teacherId: string) {
  const [linkedStudents, activeAssignments] = await Promise.all([
    prisma.teacherStudentLink.findMany({
      where: {
        teacherId,
        status: LinkStatus.ACTIVE,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        student: {
          include: {
            profile: true,
            practiceItems: {
              where: {
                isActive: true,
              },
              orderBy: [{ updatedAt: 'desc' }, { title: 'asc' }],
              select: {
                id: true,
                title: true,
                category: true,
                notes: true,
              },
            },
          },
        },
      },
    }),
    prisma.assignment.findMany({
      where: {
        teacherId,
        status: 'ACTIVE',
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        student: {
          include: {
            profile: true,
          },
        },
        items: {
          include: {
            practiceItem: true,
          },
        },
      },
      take: 12,
    }),
  ])

  const students = linkedStudents
    .map((link) => {
      if (!link.student) {
        return null
      }

      return {
        id: link.student.id,
        displayName: link.student.profile?.displayName || link.student.name || link.student.email,
        email: link.student.email,
        practiceItems: link.student.practiceItems,
      }
    })
    .filter((student): student is NonNullable<typeof student> => Boolean(student))

  const assignments = activeAssignments.map((assignment) => ({
    id: assignment.id,
    title: assignment.title,
    notes: assignment.notes,
    focusAreas: assignment.focusAreas,
    dueDate: assignment.dueDate,
    createdAt: assignment.createdAt,
    student: {
      id: assignment.student.id,
      displayName:
        assignment.student.profile?.displayName || assignment.student.name || assignment.student.email,
      email: assignment.student.email,
    },
    items: assignment.items.map((item) => ({
      id: item.id,
      practiceItemId: item.practiceItem.id,
      title: item.practiceItem.title,
      category: item.practiceItem.category,
    })),
  }))

  return {
    students,
    assignments,
  }
}
