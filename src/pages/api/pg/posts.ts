import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

interface WhereClause {
  status?: string
  category_id?: number
  slug?: string
  is_featured?: boolean
  OR?: Array<{
    title?: { contains: string }
    content?: { contains: string }
    excerpt?: { contains: string }
  }>
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { 
        page = '1', 
        limit = '10', 
        status,
        category_id,
        search,
        slug,
        is_featured,
        featured_only
      } = req.query

      const pageNumber = parseInt(page as string)
      const limitNumber = parseInt(limit as string)
      const skip = (pageNumber - 1) * limitNumber

      // Construir where clause
      const where: WhereClause = {}
      
      if (status) {
        where.status = status as string
      }
      
      if (category_id) {
        where.category_id = parseInt(category_id as string)
      }
      
      if (is_featured !== undefined) {
        where.is_featured = is_featured === 'true'
      }
      
      // Se featured_only for true, buscar apenas posts em destaque
      if (featured_only === 'true') {
        where.is_featured = true
      }
      
      if (search) {
        // Para SQLite, usar contains sem mode
        where.OR = [
          { title: { contains: search as string } },
          { content: { contains: search as string } },
          { excerpt: { contains: search as string } },
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
              name: true,
              color: true
            }
          }
        },
        orderBy: [
          { is_featured: 'desc' },
          { published_at: 'desc' }
        ],
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
      console.error('❌ Erro ao buscar posts:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
} 