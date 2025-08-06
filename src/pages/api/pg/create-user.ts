import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Verificar se já existe algum usuário no sistema
    const userCount = await prisma.users.count()
    
    if (userCount > 0) {
      return res.status(403).json({ 
        message: 'Setup já foi realizado. Não é possível criar mais usuários através desta API.' 
      })
    }

    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' })
    }

    // Verificar se já existe um usuário com este email
    const existingUser = await prisma.users.findFirst({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já existe' })
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Criar usuário
    const user = await prisma.users.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        super_adm: true, // Primeiro usuário será super admin
        is_active: true
      }
    })

    // Retornar dados do usuário (sem a senha)
    const { password: _, ...userWithoutPassword } = user

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
} 