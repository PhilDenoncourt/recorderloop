'use server'

import { revalidatePath } from 'next/cache'

import { requireStudent } from '@/lib/permissions'
import { redeemTeacherInviteCode } from '@/lib/teacher-linking'

export type ConnectFormState = {
  error?: string
  success?: string
}

export async function connectTeacherAction(
  _previousState: ConnectFormState,
  formData: FormData,
): Promise<ConnectFormState> {
  const session = await requireStudent()
  const inviteCode = String(formData.get('inviteCode') ?? '')

  const result = await redeemTeacherInviteCode({
    studentId: session.user.id,
    inviteCode,
  })

  if (!result.ok) {
    return {
      error: result.error,
    }
  }

  revalidatePath('/student')
  revalidatePath('/teacher')
  revalidatePath('/teacher/students')
  revalidatePath('/connect')

  return {
    success: `Connected to ${result.teacherDisplayName}.`,
  }
}
