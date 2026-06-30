import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { hashResetToken } from '../../../lib/authToken'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ message: 'Token e nova senha são obrigatórios' })
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres' })
    }

    const record = await prisma.passwordResetToken.findFirst({
      where: {
        token_hash: hashResetToken(String(token)),
        used_at: null,
        expires_at: { gt: new Date() },
      },
      include: {
        user: {
          select: { id: true, is_active: true },
        },
      },
    })

    if (!record || !record.user.is_active) {
      return res.status(400).json({ message: 'Token inválido ou expirado' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.$transaction([
      prisma.users.update({
        where: { id: record.user_id },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { used_at: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          user_id: record.user_id,
          used_at: null,
          id: { not: record.id },
        },
      }),
    ])

    return res.status(200).json({
      message: 'Senha redefinida com sucesso',
    })
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
}
