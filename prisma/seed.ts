import { LinkStatus, PracticeItemCategory, PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {
      name: 'Demo Teacher',
      role: UserRole.TEACHER,
      profile: {
        upsert: {
          create: {
            displayName: 'Demo Teacher',
            timezone: 'America/New_York',
          },
          update: {
            displayName: 'Demo Teacher',
            timezone: 'America/New_York',
          },
        },
      },
    },
    create: {
      email: 'teacher@example.com',
      name: 'Demo Teacher',
      role: UserRole.TEACHER,
      profile: {
        create: {
          displayName: 'Demo Teacher',
          timezone: 'America/New_York',
        },
      },
    },
  })

  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {
      name: 'Demo Student',
      role: UserRole.STUDENT,
      profile: {
        upsert: {
          create: {
            displayName: 'Demo Student',
            timezone: 'America/New_York',
            instrumentLevel: 'beginner',
          },
          update: {
            displayName: 'Demo Student',
            timezone: 'America/New_York',
            instrumentLevel: 'beginner',
          },
        },
      },
    },
    create: {
      email: 'student@example.com',
      name: 'Demo Student',
      role: UserRole.STUDENT,
      profile: {
        create: {
          displayName: 'Demo Student',
          timezone: 'America/New_York',
          instrumentLevel: 'beginner',
        },
      },
    },
  })

  await prisma.teacherStudentLink.upsert({
    where: {
      teacherId_studentId: {
        teacherId: teacher.id,
        studentId: student.id,
      },
    },
    update: {
      status: LinkStatus.ACTIVE,
    },
    create: {
      teacherId: teacher.id,
      studentId: student.id,
      status: LinkStatus.ACTIVE,
    },
  })

  const existingLongTone = await prisma.practiceItem.findFirst({
    where: {
      studentId: student.id,
      title: 'Long tones in G',
    },
  })

  const longTone = existingLongTone
    ? await prisma.practiceItem.update({
        where: { id: existingLongTone.id },
        data: {
          category: PracticeItemCategory.EXERCISE,
          createdByUserId: teacher.id,
          notes: 'Focus on breath support and even tone.',
          isActive: true,
        },
      })
    : await prisma.practiceItem.create({
        data: {
          title: 'Long tones in G',
          category: PracticeItemCategory.EXERCISE,
          studentId: student.id,
          createdByUserId: teacher.id,
          notes: 'Focus on breath support and even tone.',
          isActive: true,
        },
      })

  const existingPiece = await prisma.practiceItem.findFirst({
    where: {
      studentId: student.id,
      title: 'Greensleeves',
    },
  })

  const piece = existingPiece
    ? await prisma.practiceItem.update({
        where: { id: existingPiece.id },
        data: {
          category: PracticeItemCategory.PIECE,
          createdByUserId: student.id,
          notes: 'Work on clean phrase endings.',
          isActive: true,
        },
      })
    : await prisma.practiceItem.create({
        data: {
          title: 'Greensleeves',
          category: PracticeItemCategory.PIECE,
          studentId: student.id,
          createdByUserId: student.id,
          notes: 'Work on clean phrase endings.',
          isActive: true,
        },
      })

  const existingAssignment = await prisma.assignment.findFirst({
    where: {
      teacherId: teacher.id,
      studentId: student.id,
      title: 'Week 1 practice focus',
    },
  })

  const assignment = existingAssignment
    ? await prisma.assignment.update({
        where: { id: existingAssignment.id },
        data: {
          notes: 'Keep sessions short and consistent.',
          focusAreas: 'Steady airflow, phrase endings, slower tempo accuracy.',
          status: 'ACTIVE',
        },
      })
    : await prisma.assignment.create({
        data: {
          teacherId: teacher.id,
          studentId: student.id,
          title: 'Week 1 practice focus',
          notes: 'Keep sessions short and consistent.',
          focusAreas: 'Steady airflow, phrase endings, slower tempo accuracy.',
        },
      })

  await prisma.assignmentItem.upsert({
    where: {
      assignmentId_practiceItemId: {
        assignmentId: assignment.id,
        practiceItemId: longTone.id,
      },
    },
    update: {},
    create: {
      assignmentId: assignment.id,
      practiceItemId: longTone.id,
    },
  })

  await prisma.assignmentItem.upsert({
    where: {
      assignmentId_practiceItemId: {
        assignmentId: assignment.id,
        practiceItemId: piece.id,
      },
    },
    update: {},
    create: {
      assignmentId: assignment.id,
      practiceItemId: piece.id,
    },
  })

  const existingSeedSession = await prisma.practiceSession.findFirst({
    where: {
      studentId: student.id,
      notes: 'SEED: baseline practice session',
    },
    include: {
      items: true,
    },
  })

  if (!existingSeedSession) {
    await prisma.practiceSession.create({
      data: {
        studentId: student.id,
        sessionDate: new Date('2026-04-01T15:00:00.000Z'),
        durationMinutes: 25,
        notes: 'SEED: baseline practice session',
        items: {
          create: [
            {
              practiceItemId: longTone.id,
              tempoReached: 'N/A',
              improvementNotes: 'Tone stayed steadier for longer.',
              weakSpots: 'Still losing air support near the end.',
            },
            {
              practiceItemId: piece.id,
              tempoReached: '72 bpm',
              improvementNotes: 'Phrase endings were cleaner.',
              weakSpots: 'Measure transition before final phrase.',
            },
          ],
        },
      },
    })
  }

  console.log('Seed complete.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
