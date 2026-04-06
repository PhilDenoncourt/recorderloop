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
          practiceSessions: {
            orderBy: {
              sessionDate: 'desc',
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

  return {
    students: links.map((link) => ({
      linkId: link.id,
      student: link.student,
    })),
  }
}
