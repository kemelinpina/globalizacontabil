import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { status = 'published', limit = 10, page = 1 } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    // Buscar posts
    const posts = await prisma.posts.findMany({
      where: {
        status: status as string,
        category: {
          is_active: true
        }
      },
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
            url: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: Number(limit)
    })

    // Contar total de posts
    const total = await prisma.posts.count({
      where: {
        status: status as string,
        category: {
          is_active: true
        }
      }
    })

    return res.status(200).json({
      posts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    })

  } catch (error) {
    console.error('Erro ao buscar posts:', error)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
} 