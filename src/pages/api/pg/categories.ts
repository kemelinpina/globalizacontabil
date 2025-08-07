import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

interface WhereClause {
  is_active?: boolean
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { is_active } = req.query

      const where: WhereClause = {}
      
      if (is_active !== undefined) {
        where.is_active = is_active === 'true'
      }

      const categories = await prisma.categories.findMany({
        where,
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })

      return res.status(200).json({
        categories
      })

    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
} 