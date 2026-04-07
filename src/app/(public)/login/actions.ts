'use server'

import { AuthError } from 'next-auth'

import { signIn } from '@/lib/auth'

export type RequestMagicLinkState = {
  ok: boolean
  error?: string
}

export async function requestMagicLink(
  _prevState: RequestMagicLinkState,
  formData: FormData,
): Promise<RequestMagicLinkState> {
  const email = formData.get('email')

  if (typeof email !== 'string' || !email.trim()) {
    return {
      ok: false,
      error: 'Please enter a valid email address.',
    }
  }

  try {
    await signIn('resend', {
      email: email.trim(),
      redirectTo: `/login/check-email?email=${encodeURIComponent(email.trim())}`,
    })

    return {
      ok: true,
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: false,
        error:
          'We could not send a sign-in link right now. Double-check the email address and, if this is a deployment, verify AUTH_SECRET, AUTH_URL, AUTH_EMAIL_FROM, and RESEND_API_KEY.',
      }
    }

    throw error
  }
}
