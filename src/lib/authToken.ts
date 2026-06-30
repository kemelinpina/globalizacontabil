import { createHash, randomBytes } from 'crypto'

export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000

export function generateResetToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashResetToken(plainToken: string): string {
  return createHash('sha256').update(plainToken).digest('hex')
}
