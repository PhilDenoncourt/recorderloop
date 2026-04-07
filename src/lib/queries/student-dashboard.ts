import { prisma } from '@/lib/prisma'

const MS_PER_DAY = 24 * 60 * 60 * 1000

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getDateKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10)
}

export async function getStudentDashboardData(studentId: string) {
  const [assignments, practiceItems, recentSessions, allRecentSessions] = await Promise.all([
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
      take: 20,
    }),
  ])

  const now = new Date()
  const startToday = startOfDay(now)
  const start7Days = new Date(startToday.getTime() - 6 * MS_PER_DAY)
  const sessionsLast7Days = allRecentSessions.filter((session) => session.sessionDate >= start7Days)
  const activeDaysLast7Days = new Set(sessionsLast7Days.map((session) => getDateKey(session.sessionDate))).size

  const assignmentCoverage = assignments.map((assignment) => {
    const assignedItems = assignment.items.map((item) => item.practiceItem)
    const assignedItemIds = new Set(assignedItems.map((item) => item.id))

    const matchedSessions = allRecentSessions.filter((session) =>
      session.items.some((item) => assignedItemIds.has(item.practiceItemId)),
    )

    const practicedAssignedItemIds = new Set(
      matchedSessions.flatMap((session) =>
        session.items
          .filter((item) => assignedItemIds.has(item.practiceItemId))
          .map((item) => item.practiceItemId),
      ),
    )

    const completionPercent = assignedItems.length
      ? Math.round((practicedAssignedItemIds.size / assignedItems.length) * 100)
      : 0

    const latestMatchedSession = matchedSessions[0] ?? null

    return {
      assignmentId: assignment.id,
      practicedAssignedItems: practicedAssignedItemIds.size,
      totalAssignedItems: assignedItems.length,
      completionPercent,
      latestMatchedSessionDate: latestMatchedSession?.sessionDate ?? null,
    }
  })

  const itemTrendMap = new Map<
    string,
    {
      practiceItemId: string
      title: string
      category: string
      sessionsCount: number
      latestSessionDate: Date
      latestTempo: string | null
      latestImprovement: string | null
      latestWeakSpot: string | null
    }
  >()

  for (const session of allRecentSessions) {
    for (const item of session.items) {
      const existing = itemTrendMap.get(item.practiceItemId)

      if (existing) {
        existing.sessionsCount += 1
        if (session.sessionDate > existing.latestSessionDate) {
          existing.latestSessionDate = session.sessionDate
          existing.latestTempo = item.tempoReached
          existing.latestImprovement = item.improvementNotes
          existing.latestWeakSpot = item.weakSpots
        }
      } else {
        itemTrendMap.set(item.practiceItemId, {
          practiceItemId: item.practiceItemId,
          title: item.practiceItem.title,
          category: item.practiceItem.category,
          sessionsCount: 1,
          latestSessionDate: session.sessionDate,
          latestTempo: item.tempoReached,
          latestImprovement: item.improvementNotes,
          latestWeakSpot: item.weakSpots,
        })
      }
    }
  }

  const itemTrends = Array.from(itemTrendMap.values())
    .sort((a, b) => {
      if (b.sessionsCount !== a.sessionsCount) {
        return b.sessionsCount - a.sessionsCount
      }

      return b.latestSessionDate.getTime() - a.latestSessionDate.getTime()
    })
    .slice(0, 5)

  const progressSummary = {
    sessionsLast7Days: sessionsLast7Days.length,
    activeDaysLast7Days,
    totalMinutesLast7Days: sessionsLast7Days.reduce((sum, session) => sum + (session.durationMinutes ?? 0), 0),
    assignmentsWithProgress: assignmentCoverage.filter((assignment) => assignment.practicedAssignedItems > 0).length,
    totalAssignmentsTracked: assignmentCoverage.length,
  }

  return {
    assignments,
    practiceItems,
    recentSessions,
    progressSummary,
    assignmentCoverage,
    itemTrends,
  }
}
