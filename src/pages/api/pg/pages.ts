import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { logCreate } from '../../../utils/logService'

// Função para gerar slug único
const generateUniqueSlug = async (title: string, excludeId?: number): Promise<string> => {
  // Converter título para slug
  let baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens múltiplos
    .replace(/^-|-$/g, '') // Remove hífens do início e fim

  let slug = baseSlug
  let counter = 1

  // Verificar se slug já existe
  while (true) {
    const existingPage = await prisma.pages.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } })
      }
    })

    if (!existingPage) {
      break
    }

    // Se existe, adicionar número sequencial
    counter++
    slug = `${baseSlug}-${counter}`
  }

  return slug
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { 
        status, 
        is_featured, 
        featured_only, 
        page = '1', 
        limit = '20',
        search,
        author_id,
        template
      } = req.query

      const pageNumber = parseInt(page as string)
      const limitNumber = parseInt(limit as string)
      const skip = (pageNumber - 1) * limitNumber

      // Construir where clause
      const where: {
        status?: string
        is_featured?: boolean
        author_id?: number
        template?: string
        OR?: any[]
      } = {}

      if (status) {
        where.status = status as string
      }

      if (is_featured !== undefined) {
        where.is_featured = is_featured === 'true'
      }

      if (featured_only === 'true') {
        where.is_featured = true
      }

      if (author_id) {
        where.author_id = parseInt(author_id as string)
      }

      if (template) {
        where.template = template as string
      }

      // Busca por título, slug ou conteúdo
      if (search) {
        where.OR = [
          { title: { contains: search as string } },
          { slug: { contains: search as string } },
          { excerpt: { contains: search as string } },
        ]
      }

      // Buscar páginas
      const pages = await prisma.pages.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: [
          { is_featured: 'desc' },
          { published_at: 'desc' },
          { created_at: 'desc' }
        ],
        skip,
        take: limitNumber
      })

      // Contar total de páginas
      const total = await prisma.pages.count({ where })

      return res.status(200).json({
        pages,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          pages: Math.ceil(total / limitNumber)
        }
      })

    } catch (error) {
      console.error('Erro ao buscar páginas:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        title,
        content,
        excerpt,
        featured_image,
        social_image,
        status,
        author_id,
        meta_title,
        meta_description,
        key_word_seo,
        is_featured,
        template,
        custom_css,
        custom_js,
        published_at
      } = req.body

      // Validações básicas
      if (!title || !content || !author_id) {
        return res.status(400).json({ 
          message: 'Título, conteúdo e autor são obrigatórios' 
        })
      }

      // Gerar slug único
      const slug = await generateUniqueSlug(title)

      // Criar página
      const page = await prisma.pages.create({
        data: {
          title,
          content,
          slug,
          excerpt: excerpt || null,
          featured_image: featured_image || null,
          social_image: social_image || null,
          status: status || 'draft',
          author_id: parseInt(author_id),
          meta_title: meta_title || null,
          meta_description: meta_description || null,
          key_word_seo: key_word_seo || null,
          is_featured: is_featured || false,
          template: template || 'default',
          custom_css: custom_css || null,
          custom_js: custom_js || null,
          published_at: published_at ? new Date(published_at) : null
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      // Registrar log de criação
      await logCreate(
        parseInt(author_id),
        'pages',
        page.id,
        page.title,
        page,
        req,
        `Página "${page.title}" criada`
      )

      return res.status(201).json({
        message: 'Página criada com sucesso',
        page
      })

    } catch (error) {
      console.error('Erro ao criar página:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
