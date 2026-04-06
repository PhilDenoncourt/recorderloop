import { prisma } from '@/lib/prisma'

export async function getStudentDashboardData(studentId: string) {
  const [assignments, practiceItems, recentSessions] = await Promise.all([
    prisma.assignment.findMany({
      where: {
        studentId,
        status: 'ACTIVE',
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        items: {
          include: {
            practiceItem: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: 5,
    }),
    prisma.practiceItem.findMany({
      where: {
        studentId,
        isActive: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10,
    }),
    prisma.practiceSession.findMany({
      where: {
        studentId,
      },
      orderBy: {
        sessionDate: 'desc',
      },
      include: {
        items: {
          include: {
            practiceItem: true,
          },
        },
      },
      take: 5,
    }),
  ])

  return {
    assignments,
    practiceItems,
    recentSessions,
  }
}
