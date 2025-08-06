import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { active = 'true' } = req.query

    // Buscar categorias
    const categories = await prisma.categories.findMany({
      where: {
        is_active: active === 'true'
      },
      orderBy: {
        order: 'asc'
      },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    return res.status(200).json({
      categories,
      total: categories.length
    })

  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
} 