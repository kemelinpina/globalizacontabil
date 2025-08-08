import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import emailService from '../../../utils/emailService'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' })
    }

    // Verificar se o usuário existe
    const user = await prisma.users.findFirst({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      // Por segurança, sempre retornar sucesso mesmo se o usuário não existir
      return res.status(200).json({ message: 'Email de redefinição enviado com sucesso' })
    }

    // Gerar token de redefinição
    const resetToken = crypto.randomBytes(32).toString('hex')
    // const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora - será usado quando implementar persistência

    // Salvar token no banco (você pode criar uma tabela para isso)
    // Por enquanto, vamos apenas enviar o email com o token
    // Em produção, você deve salvar o token no banco de dados

    // Enviar email de redefinição
    const emailSent = await emailService.sendPasswordResetEmail(user.email, resetToken)

    if (!emailSent) {
      return res.status(500).json({ message: 'Erro ao enviar email de redefinição' })
    }

    return res.status(200).json({
      message: 'Email de redefinição enviado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao processar redefinição de senha:', error)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
}
