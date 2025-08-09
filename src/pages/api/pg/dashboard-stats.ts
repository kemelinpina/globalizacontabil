import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    // Buscar estatísticas em paralelo para melhor performance
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalPages,
      publishedPages,
      totalCategories,
      activeCategories,
      totalUsers,
      activeUsers,
      totalFiles,
      recentPosts,
      recentPages,
      topViewedPosts,
      topViewedPages
    ] = await Promise.all([
      // Posts
      prisma.posts.count(),
      prisma.posts.count({ where: { status: 'published' } }),
      prisma.posts.count({ where: { status: 'draft' } }),
      
      // Páginas
      prisma.pages.count(),
      prisma.pages.count({ where: { status: 'published' } }),
      
      // Categorias
      prisma.categories.count(),
      prisma.categories.count({ where: { is_active: true } }),
      
      // Usuários
      prisma.users.count(),
      prisma.users.count({ where: { is_active: true } }),
      
      // Arquivos
      prisma.files.count(),
      
      // Posts recentes (últimos 5)
      prisma.posts.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          created_at: true,
          author: {
            select: {
              name: true
            }
          }
        }
      }),
      
      // Páginas recentes (últimas 5)
      prisma.pages.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          created_at: true,
          author: {
            select: {
              name: true
            }
          }
        }
      }),
      
      // Posts mais visualizados (top 5)
      prisma.posts.findMany({
        take: 5,
        where: { status: 'published' },
        orderBy: { view_count: 'desc' },
        select: {
          id: true,
          title: true,
          view_count: true,
          slug: true
        }
      }),
      
      // Páginas mais visualizadas (top 5)
      prisma.pages.findMany({
        take: 5,
        where: { status: 'published' },
        orderBy: { view_count: 'desc' },
        select: {
          id: true,
          title: true,
          view_count: true,
          slug: true
        }
      })
    ])

    // Calcular estatísticas adicionais
    const postsGrowth = totalPosts > 0 ? ((publishedPosts / totalPosts) * 100).toFixed(1) : '0'
    const pagesGrowth = totalPages > 0 ? ((publishedPages / totalPages) * 100).toFixed(1) : '0'
    const categoriesGrowth = totalCategories > 0 ? ((activeCategories / totalCategories) * 100).toFixed(1) : '0'
    const usersGrowth = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0'

    const stats = {
      // Estatísticas principais
      posts: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
        growth: postsGrowth
      },
      pages: {
        total: totalPages,
        published: publishedPages,
        draft: totalPages - publishedPages,
        growth: pagesGrowth
      },
      categories: {
        total: totalCategories,
        active: activeCategories,
        inactive: totalCategories - activeCategories,
        growth: categoriesGrowth
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        growth: usersGrowth
      },
      files: {
        total: totalFiles
      },
      
      // Conteúdo recente
      recent: {
        posts: recentPosts.map(post => ({
          ...post,
          created_at: post.created_at.toISOString()
        })),
        pages: recentPages.map(page => ({
          ...page,
          created_at: page.created_at.toISOString()
        }))
      },
      
      // Mais populares
      popular: {
        posts: topViewedPosts,
        pages: topViewedPages
      }
    }

    return res.status(200).json(stats)

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
}
