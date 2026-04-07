import { prisma } from '@/lib/prisma'

function normalizeInsight(text: string | null | undefined) {
  return text?.trim().toLowerCase() ?? ''
}

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

  const itemInsights = recentSessions
    .flatMap((session) =>
      session.items.map((item) => ({
        sessionId: session.id,
        sessionDate: session.sessionDate,
        practiceItemId: item.practiceItemId,
        practiceItemTitle: item.practiceItem.title,
        tempoReached: item.tempoReached,
        improvementNotes: item.improvementNotes,
        weakSpots: item.weakSpots,
      })),
    )
    .sort((a, b) => b.sessionDate.getTime() - a.sessionDate.getTime())

  const repeatedWeakSpotMap = new Map<
    string,
    {
      label: string
      count: number
      itemTitles: Set<string>
      latestDate: Date
    }
  >()

  for (const insight of itemInsights) {
    const key = normalizeInsight(insight.weakSpots)

    if (!key) {
      continue
    }

    const existing = repeatedWeakSpotMap.get(key)

    if (existing) {
      existing.count += 1
      existing.itemTitles.add(insight.practiceItemTitle)
      if (insight.sessionDate > existing.latestDate) {
        existing.latestDate = insight.sessionDate
      }
    } else {
      repeatedWeakSpotMap.set(key, {
        label: insight.weakSpots!.trim(),
        count: 1,
        itemTitles: new Set([insight.practiceItemTitle]),
        latestDate: insight.sessionDate,
      })
    }
  }

  const repeatedWeakSpots = Array.from(repeatedWeakSpotMap.values())
    .filter((entry) => entry.count >= 2)
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count
      }

      return b.latestDate.getTime() - a.latestDate.getTime()
    })
    .slice(0, 6)
    .map((entry) => ({
      label: entry.label,
      count: entry.count,
      itemTitles: Array.from(entry.itemTitles),
      latestDate: entry.latestDate,
    }))

  return {
    student,
    practiceItems,
    recentSessions,
    assignments,
    itemInsights,
    repeatedWeakSpots,
    summary: {
      activePracticeItems: practiceItems.length,
      activeAssignments: assignments.length,
      recentSessions: recentSessions.length,
      totalRecentMinutes: recentSessions.reduce((sum, session) => sum + (session.durationMinutes ?? 0), 0),
      sessionsWithNotes: recentSessions.filter(
        (session) =>
          Boolean(session.notes?.trim()) ||
          session.items.some(
            (item) =>
              Boolean(item.improvementNotes?.trim()) ||
              Boolean(item.weakSpots?.trim()) ||
              Boolean(item.tempoReached?.trim()),
          ),
      ).length,
    },
  }
}
