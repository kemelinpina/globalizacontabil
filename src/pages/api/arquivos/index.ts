import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '20', type } = req.query

      const pageNumber = parseInt(page as string)
      const limitNumber = parseInt(limit as string)
      const skip = (pageNumber - 1) * limitNumber

      // Construir where clause
      const where: any = {}
      
      if (type) {
        where.type = { startsWith: type as string }
      }

      // Buscar arquivos
      const files = await prisma.files.findMany({
        where,
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limitNumber
      })

      // Contar total de arquivos
      const total = await prisma.files.count({ where })

      return res.status(200).json({
        files,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          pages: Math.ceil(total / limitNumber)
        }
      })

    } catch (error) {
      console.error('Erro ao buscar arquivos:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
