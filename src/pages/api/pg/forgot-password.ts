import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import emailService from '../../../utils/emailService'
import {
  generateResetToken,
  hashResetToken,
  PASSWORD_RESET_TTL_MS,
} from '../../../lib/authToken'
import { debugLog } from '../../../lib/debugLog'

const GENERIC_SUCCESS = {
  message: 'Se o e-mail existir, você receberá instruções para redefinir sua senha.',
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email é obrigatório' })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // #region agent log
    debugLog({
      location: 'forgot-password.ts:entry',
      message: 'forgot-password request',
      data: { normalizedEmail, hasBrevoKey: Boolean(process.env.BREVO_API_KEY) },
      hypothesisId: 'A,D',
      runId: 'pre-fix',
    })
    // #endregion

    const user = await prisma.users.findFirst({
      where: { email: normalizedEmail, is_active: true },
    })

    if (!user) {
      // #region agent log
      debugLog({
        location: 'forgot-password.ts:no-user',
        message: 'user not found or inactive',
        data: { normalizedEmail },
        hypothesisId: 'A',
        runId: 'pre-fix',
      })
      // #endregion
      return res.status(200).json(GENERIC_SUCCESS)
    }

    const plainToken = generateResetToken()
    const tokenHash = hashResetToken(plainToken)
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS)

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({
        where: { user_id: user.id, used_at: null },
      }),
      prisma.passwordResetToken.create({
        data: {
          user_id: user.id,
          token_hash: tokenHash,
          expires_at: expiresAt,
        },
      }),
    ])

    // #region agent log
    debugLog({
      location: 'forgot-password.ts:token-saved',
      message: 'reset token persisted',
      data: { userId: user.id, expiresAt: expiresAt.toISOString() },
      hypothesisId: 'B',
      runId: 'pre-fix',
    })
    // #endregion

    const emailSent = await emailService.sendPasswordResetEmail(user.email, plainToken)

    // #region agent log
    debugLog({
      location: 'forgot-password.ts:email-result',
      message: 'password reset email attempt finished',
      data: { userId: user.id, emailSent },
      hypothesisId: 'C',
      runId: 'pre-fix',
    })
    // #endregion

    if (!emailSent) {
      return res.status(500).json({ message: 'Erro ao enviar email de redefinição' })
    }

    return res.status(200).json(GENERIC_SUCCESS)
  } catch (error) {
    // #region agent log
    debugLog({
      location: 'forgot-password.ts:error',
      message: 'forgot-password failed',
      data: {
        errorName: error instanceof Error ? error.name : 'unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
      },
      hypothesisId: 'B,C,D',
      runId: 'pre-fix',
    })
    // #endregion
    console.error('Erro ao processar redefinição de senha:', error)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
}
