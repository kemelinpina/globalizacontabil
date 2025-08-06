import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Contar usuários no banco
    const userCount = await prisma.users.count()
    
    // Buscar todos os usuários (sem senha)
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        super_adm: true,
        is_active: true,
        created_at: true
      }
    })

    return res.status(200).json({
      userCount,
      users,
      message: userCount === 0 ? 'Nenhum usuário encontrado' : `${userCount} usuário(s) encontrado(s)`
    })

  } catch (error) {
    console.error('Erro ao verificar usuários:', error)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
} 