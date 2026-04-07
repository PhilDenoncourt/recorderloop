import { prisma } from '@/lib/prisma'

const MS_PER_DAY = 24 * 60 * 60 * 1000

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getDateKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10)
}

export async function getStudentHistoryData(studentId: string) {
  const [sessions, assignments] = await Promise.all([
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
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
        teacher: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      take: 10,
    }),
  ])

  const now = new Date()
  const startToday = startOfDay(now)
  const start7Days = new Date(startToday.getTime() - 6 * MS_PER_DAY)
  const start30Days = new Date(startToday.getTime() - 29 * MS_PER_DAY)

  const sessionsLast7Days = sessions.filter((session) => session.sessionDate >= start7Days)
  const sessionsLast30Days = sessions.filter((session) => session.sessionDate >= start30Days)

  const activeDaysLast7Days = new Set(sessionsLast7Days.map((session) => getDateKey(session.sessionDate))).size
  const activeDaysLast30Days = new Set(sessionsLast30Days.map((session) => getDateKey(session.sessionDate))).size

  let streakDays = 0
  const uniqueSessionDays = new Set(sessions.map((session) => getDateKey(session.sessionDate)))

  for (let offset = 0; ; offset += 1) {
    const day = new Date(startToday.getTime() - offset * MS_PER_DAY)

    if (uniqueSessionDays.has(getDateKey(day))) {
      streakDays += 1
      continue
    }

    if (offset === 0) {
      const yesterday = new Date(startToday.getTime() - MS_PER_DAY)

      if (uniqueSessionDays.has(getDateKey(yesterday))) {
        continue
      }
    }

    break
  }

  const itemSummaryMap = new Map<
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

  for (const session of sessions) {
    for (const item of session.items) {
      const existing = itemSummaryMap.get(item.practiceItemId)

      if (existing) {
        existing.sessionsCount += 1
        if (session.sessionDate > existing.latestSessionDate) {
          existing.latestSessionDate = session.sessionDate
          existing.latestTempo = item.tempoReached
          existing.latestImprovement = item.improvementNotes
          existing.latestWeakSpot = item.weakSpots
        }
      } else {
        itemSummaryMap.set(item.practiceItemId, {
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

  const itemSummaries = Array.from(itemSummaryMap.values())
    .sort((a, b) => {
      if (b.sessionsCount !== a.sessionsCount) {
        return b.sessionsCount - a.sessionsCount
      }

      return b.latestSessionDate.getTime() - a.latestSessionDate.getTime()
    })
    .slice(0, 6)

  const assignmentProgress = assignments.map((assignment) => {
    const assignedItemIds = new Set(assignment.items.map((item) => item.practiceItemId))
    const matchedSessions = sessions.filter((session) =>
      session.items.some((item) => assignedItemIds.has(item.practiceItemId)),
    )
    const practicedAssignedItems = new Set(
      matchedSessions.flatMap((session) =>
        session.items
          .filter((item) => assignedItemIds.has(item.practiceItemId))
          .map((item) => item.practiceItemId),
      ),
    )

    return {
      assignmentId: assignment.id,
      title: assignment.title,
      dueDate: assignment.dueDate,
      teacherName: assignment.teacher.name || assignment.teacher.email,
      practicedAssignedItems: practicedAssignedItems.size,
      totalAssignedItems: assignment.items.length,
      completionPercent: assignment.items.length
        ? Math.round((practicedAssignedItems.size / assignment.items.length) * 100)
        : 0,
    }
  })

  return {
    sessions,
    itemSummaries,
    assignmentProgress,
    summary: {
      totalSessions: sessions.length,
      sessionsLast7Days: sessionsLast7Days.length,
      totalMinutesLast7Days: sessionsLast7Days.reduce((sum, session) => sum + (session.durationMinutes ?? 0), 0),
      totalMinutesLast30Days: sessionsLast30Days.reduce((sum, session) => sum + (session.durationMinutes ?? 0), 0),
      activeDaysLast7Days,
      activeDaysLast30Days,
      streakDays,
      assignmentsWithProgress: assignmentProgress.filter((assignment) => assignment.practicedAssignedItems > 0).length,
      totalAssignmentsTracked: assignmentProgress.length,
    },
  }
}
