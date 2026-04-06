'use server'

import { UserRole } from '@prisma/client'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'

const onboardingSchema = z.object({
  role: z.nativeEnum(UserRole),
  displayName: z.string().trim().min(1).max(100).optional().or(z.literal('')),
  timezone: z.string().trim().max(100).optional().or(z.literal('')),
})

export async function completeOnboarding(formData: FormData) {
  const session = await requireSession()

  const parsed = onboardingSchema.safeParse({
    role: formData.get('role'),
    displayName: formData.get('displayName'),
    timezone: formData.get('timezone'),
  })

  if (!parsed.success) {
    return {
      ok: false,
      error: 'Please complete all required onboarding fields.',
    }
  }

  const { role, displayName, timezone } = parsed.data

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      role,
      profile: {
        upsert: {
          create: {
            displayName: displayName || null,
            timezone: timezone || null,
          },
          update: {
            displayName: displayName || null,
            timezone: timezone || null,
          },
        },
      },
    },
  })

  redirect(role === UserRole.TEACHER ? '/teacher' : '/student')
}
