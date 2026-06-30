/**
 * Simula o handler forgot-password contra o banco/Brevo reais (sem HTTP).
 * Gera logs em debug-7a833e.log para diagnostico.
 */
import { PrismaClient } from '@prisma/client'
import emailService from '../src/utils/emailService'
import {
  generateResetToken,
  hashResetToken,
  PASSWORD_RESET_TTL_MS,
} from '../src/lib/authToken'
import { debugLog } from '../src/lib/debugLog'

const prisma = new PrismaClient()
const TEST_EMAIL = process.argv[2] || 'kemelin@3hub.co'

async function main(): Promise<void> {
  debugLog({
    location: 'simulate-forgot.ts:start',
    message: 'simulation started',
    data: { testEmail: TEST_EMAIL, hasBrevoKey: Boolean(process.env.BREVO_API_KEY) },
    hypothesisId: 'A,C,D',
    runId: 'pre-fix',
  })

  const normalizedEmail = TEST_EMAIL.toLowerCase().trim()
  const user = await prisma.users.findFirst({
    where: { email: normalizedEmail, is_active: true },
  })

  if (!user) {
    debugLog({
      location: 'simulate-forgot.ts:no-user',
      message: 'user not found',
      data: { normalizedEmail },
      hypothesisId: 'A',
      runId: 'pre-fix',
    })
    console.log('RESULTADO: usuario nao encontrado ou inativo')
    return
  }

  const plainToken = generateResetToken()
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS)

  try {
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({
        where: { user_id: user.id, used_at: null },
      }),
      prisma.passwordResetToken.create({
        data: {
          user_id: user.id,
          token_hash: hashResetToken(plainToken),
          expires_at: expiresAt,
        },
      }),
    ])
    debugLog({
      location: 'simulate-forgot.ts:token-ok',
      message: 'token saved',
      data: { userId: user.id },
      hypothesisId: 'B',
      runId: 'pre-fix',
    })
  } catch (err) {
    debugLog({
      location: 'simulate-forgot.ts:token-error',
      message: 'token save failed',
      data: { error: err instanceof Error ? err.message : String(err) },
      hypothesisId: 'B',
      runId: 'pre-fix',
    })
    console.log('RESULTADO: falha ao salvar token -', err)
    return
  }

  const emailSent = await emailService.sendPasswordResetEmail(user.email, plainToken)
  debugLog({
    location: 'simulate-forgot.ts:done',
    message: 'simulation finished',
    data: { emailSent, userId: user.id },
    hypothesisId: 'C',
    runId: 'pre-fix',
  })

  console.log('RESULTADO:', emailSent ? 'email enviado com sucesso' : 'falha ao enviar email')
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    prisma.$disconnect()
    process.exit(1)
  })
