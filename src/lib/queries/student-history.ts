import { prisma } from '@/lib/prisma'

const MS_PER_DAY = 24 * 60 * 60 * 1000

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getDateKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10)
}

export async function getStudentHistoryData(studentId: string) {
  const sessions = await prisma.practiceSession.findMany({
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
  })

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

  return {
    sessions,
    summary: {
      totalSessions: sessions.length,
      sessionsLast7Days: sessionsLast7Days.length,
      totalMinutesLast7Days: sessionsLast7Days.reduce((sum, session) => sum + (session.durationMinutes ?? 0), 0),
      totalMinutesLast30Days: sessionsLast30Days.reduce((sum, session) => sum + (session.durationMinutes ?? 0), 0),
      activeDaysLast7Days,
      activeDaysLast30Days,
      streakDays,
    },
  }
}
