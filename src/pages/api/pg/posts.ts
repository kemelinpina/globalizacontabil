import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { 
        page = '1', 
        limit = '10', 
        status,
        category_id,
        search,
        slug
      } = req.query

      const pageNumber = parseInt(page as string)
      const limitNumber = parseInt(limit as string)
      const skip = (pageNumber - 1) * limitNumber

      // Construir where clause
      const where: any = {}
      
      if (status) {
        where.status = status
      }
      
      if (category_id) {
        where.category_id = parseInt(category_id as string)
      }
      
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { content: { contains: search as string, mode: 'insensitive' } },
          { excerpt: { contains: search as string, mode: 'insensitive' } },
        ]
      }
      
      if (slug) {
        where.slug = slug as string
      }

      // Buscar posts
      const posts = await prisma.posts.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          published_at: 'desc'
        },
        skip,
        take: limitNumber
      })

      // Contar total de posts para paginação
      const total = await prisma.posts.count({ where })

      return res.status(200).json({
        posts,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          pages: Math.ceil(total / limitNumber)
        }
      })

    } catch (error) {
      console.error('Erro ao buscar posts:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
} 