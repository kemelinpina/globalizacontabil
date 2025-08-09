import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

// Função para gerar slug único (reutilizada da API principal)
const generateUniqueSlug = async (title: string, excludeId?: number): Promise<string> => {
  let baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  let slug = baseSlug
  let counter = 1

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

    counter++
    slug = `${baseSlug}-${counter}`
  }

  return slug
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const page = await prisma.pages.findUnique({
        where: { id: parseInt(id as string) },
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

      if (!page) {
        return res.status(404).json({ message: 'Página não encontrada' })
      }

      return res.status(200).json({ page })

    } catch (error) {
      console.error('Erro ao buscar página:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'PUT') {
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

      // Verificar se a página existe
      const existingPage = await prisma.pages.findUnique({
        where: { id: parseInt(id as string) }
      })

      if (!existingPage) {
        return res.status(404).json({ message: 'Página não encontrada' })
      }

      // Gerar novo slug se o título mudou
      let slug = existingPage.slug
      if (existingPage.title !== title) {
        slug = await generateUniqueSlug(title, parseInt(id as string))
      }

      // Atualizar página
      const updatedPage = await prisma.pages.update({
        where: { id: parseInt(id as string) },
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

      return res.status(200).json({
        message: 'Página atualizada com sucesso',
        page: updatedPage
      })

    } catch (error) {
      console.error('Erro ao atualizar página:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Verificar se a página existe
      const existingPage = await prisma.pages.findUnique({
        where: { id: parseInt(id as string) }
      })

      if (!existingPage) {
        return res.status(404).json({ message: 'Página não encontrada' })
      }

      // Deletar página
      await prisma.pages.delete({
        where: { id: parseInt(id as string) }
      })

      return res.status(200).json({ message: 'Página deletada com sucesso' })

    } catch (error) {
      console.error('Erro ao deletar página:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
