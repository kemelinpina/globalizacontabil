import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' })
    }

    // Buscar usuário no banco
    const user = await prisma.users.findFirst({
      where: { 
        email: email.toLowerCase(),
        is_active: true
      }
    })

    if (!user) {
      return res.status(401).json({ message: 'Email ou senha incorretos' })
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou senha incorretos' })
    }

    // Retornar dados do usuário (sem a senha)
    const { password: _, ...userWithoutPassword } = user

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token: user.email // Usando email como token temporário
    })

  } catch (error) {
    console.error('Erro no login:', error)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
} 