import { LinkStatus } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export async function getTeacherDashboardData(teacherId: string) {
  const links = await prisma.teacherStudentLink.findMany({
    where: {
      teacherId,
      status: LinkStatus.ACTIVE,
    },
    include: {
      student: {
        include: {
          profile: true,
          practiceItems: {
            where: {
              isActive: true,
            },
            select: {
              id: true,
            },
          },
          studentAssignments: {
            where: {
              status: 'ACTIVE',
            },
            select: {
              id: true,
            },
          },
          practiceSessions: {
            orderBy: [{ sessionDate: 'desc' }, { createdAt: 'desc' }],
            include: {
              items: {
                select: {
                  id: true,
                },
              },
            },
            take: 3,
          },
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  const students = links
    .map((link) => {
      if (!link.student) {
        return null
      }

      const latestSession = link.student.practiceSessions[0] ?? null
      const totalRecentMinutes = link.student.practiceSessions.reduce(
        (sum, session) => sum + (session.durationMinutes ?? 0),
        0,
      )

      return {
        linkId: link.id,
        student: {
          id: link.student.id,
          email: link.student.email,
          name: link.student.name,
          profile: link.student.profile,
        },
        summary: {
          activePracticeItems: link.student.practiceItems.length,
          activeAssignments: link.student.studentAssignments.length,
          recentSessions: link.student.practiceSessions.length,
          totalRecentMinutes,
          latestSession,
        },
      }
    })
    .filter((student): student is NonNullable<typeof student> => Boolean(student))

  const activityFeed = students
    .flatMap(({ student, summary }) =>
      summary.latestSession
        ? [
            {
              studentId: student.id,
              studentName: student.profile?.displayName || student.name || student.email,
              sessionId: summary.latestSession.id,
              sessionDate: summary.latestSession.sessionDate,
              durationMinutes: summary.latestSession.durationMinutes,
              loggedItems: summary.latestSession.items.length,
            },
          ]
        : [],
    )
    .sort((a, b) => b.sessionDate.getTime() - a.sessionDate.getTime())
    .slice(0, 6)

  const summary = {
    activeStudents: students.length,
    studentsWithRecentActivity: students.filter(({ summary }) => summary.recentSessions > 0).length,
    totalRecentSessions: students.reduce((sum, { summary }) => sum + summary.recentSessions, 0),
    totalRecentMinutes: students.reduce((sum, { summary }) => sum + summary.totalRecentMinutes, 0),
    totalActiveAssignments: students.reduce((sum, { summary }) => sum + summary.activeAssignments, 0),
  }

  return {
    students,
    activityFeed,
    summary,
  }
}
