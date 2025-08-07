import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não fornecido' })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' do início

    // Para simplificar, vamos usar o token como email (temporário)
    // Em produção, você deve implementar JWT ou similar
    const user = await prisma.users.findFirst({
      where: {
        email: token, // Usando token como email temporariamente
        is_active: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        picture: true,
        super_adm: true,
        is_active: true
      }
    })

    if (!user) {
      return res.status(401).json({ message: 'Token inválido' })
    }

    return res.status(200).json({ user })
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
}
