import crypto from 'node:crypto'

import { LinkStatus, UserRole } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export const TEACHER_INVITE_CODE_LENGTH = 8
const INVITE_CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateTeacherInviteCode(length = TEACHER_INVITE_CODE_LENGTH) {
  const bytes = crypto.randomBytes(length)

  return Array.from(bytes, (byte) => INVITE_CODE_CHARSET[byte % INVITE_CODE_CHARSET.length]).join('')
}

export function normalizeTeacherInviteCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export async function createUniqueTeacherInviteCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateTeacherInviteCode()
    const existing = await prisma.teacherStudentLink.findUnique({
      where: {
        inviteCode: code,
      },
      select: {
        id: true,
      },
    })

    if (!existing) {
      return code
    }
  }

  throw new Error('Unable to generate a unique invite code')
}

export async function getTeacherStudentsPageData(teacherId: string) {
  const [activeLinks, pendingInvites] = await Promise.all([
    prisma.teacherStudentLink.findMany({
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
    }),
    prisma.teacherStudentLink.findMany({
      where: {
        teacherId,
        status: LinkStatus.PENDING,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        inviteCode: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ])

  return {
    students: activeLinks.map((link) => ({
      linkId: link.id,
      student: link.student,
    })),
    pendingInvites,
  }
}

export async function redeemTeacherInviteCode({
  studentId,
  inviteCode,
}: {
  studentId: string
  inviteCode: string
}) {
  const normalizedCode = normalizeTeacherInviteCode(inviteCode)

  if (!normalizedCode) {
    return {
      ok: false as const,
      error: 'Enter a valid invite code.',
    }
  }

  const pendingLink = await prisma.teacherStudentLink.findUnique({
    where: {
      inviteCode: normalizedCode,
    },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  })

  if (!pendingLink || pendingLink.status !== LinkStatus.PENDING) {
    return {
      ok: false as const,
      error: 'That invite code is invalid or has already been used.',
    }
  }

  if (pendingLink.teacher.role !== UserRole.TEACHER) {
    return {
      ok: false as const,
      error: 'This invite belongs to an account that is not set up as a teacher.',
    }
  }

  if (pendingLink.teacherId === studentId) {
    return {
      ok: false as const,
      error: 'You cannot connect to yourself.',
    }
  }

  const student = await prisma.user.findUnique({
    where: {
      id: studentId,
    },
    select: {
      id: true,
      role: true,
    },
  })

  if (!student || student.role !== UserRole.STUDENT) {
    return {
      ok: false as const,
      error: 'Only student accounts can accept teacher invite codes.',
    }
  }

  const existingLink = await prisma.teacherStudentLink.findUnique({
    where: {
      teacherId_studentId: {
        teacherId: pendingLink.teacherId,
        studentId,
      },
    },
    select: {
      id: true,
      status: true,
    },
  })

  if (existingLink && existingLink.id !== pendingLink.id) {
    if (existingLink.status === LinkStatus.ACTIVE) {
      return {
        ok: false as const,
        error: 'You are already linked to this teacher.',
      }
    }

    await prisma.teacherStudentLink.update({
      where: {
        id: existingLink.id,
      },
      data: {
        status: LinkStatus.ARCHIVED,
        inviteCode: null,
      },
    })
  }

  const activatedLink = await prisma.teacherStudentLink.update({
    where: {
      id: pendingLink.id,
    },
    data: {
      studentId,
      status: LinkStatus.ACTIVE,
      inviteCode: null,
    },
  })

  return {
    ok: true as const,
    linkId: activatedLink.id,
    teacherDisplayName: pendingLink.teacher.name ?? pendingLink.teacher.email,
  }
}
