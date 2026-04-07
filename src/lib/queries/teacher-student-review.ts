import { prisma } from '@/lib/prisma'

export async function getTeacherStudentReviewData(studentId: string) {
  const [student, practiceItems, recentSessions, assignments] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: studentId,
      },
      include: {
        profile: true,
      },
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
      orderBy: [{ sessionDate: 'desc' }, { createdAt: 'desc' }],
      include: {
        items: {
          include: {
            practiceItem: true,
          },
        },
      },
      take: 8,
    }),
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
      },
      take: 5,
    }),
  ])

  return {
    student,
    practiceItems,
    recentSessions,
    assignments,
    summary: {
      activePracticeItems: practiceItems.length,
      activeAssignments: assignments.length,
      recentSessions: recentSessions.length,
      totalRecentMinutes: recentSessions.reduce((sum, session) => sum + (session.durationMinutes ?? 0), 0),
    },
  }
}
