import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { logCreate } from '../../../utils/logService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { 
      title, 
      content, 
      excerpt, 
      slug, 
      category_id, 
      author_id,
      meta_title,
      meta_description,
      key_word_seo,
      featured_image,
      social_image,
      status = 'draft',
      is_featured = false,
      is_pinned = false,
      reading_time,
      tags
    } = req.body

    // Validações básicas
    if (!title || !content || !slug || !category_id || !author_id) {
      return res.status(400).json({ 
        message: 'Título, conteúdo, slug, categoria e autor são obrigatórios' 
      })
    }

    // Verificar se o slug já existe
    const existingPost = await prisma.posts.findFirst({
      where: { slug }
    })

    if (existingPost) {
      return res.status(400).json({ message: 'Slug já existe. Escolha outro.' })
    }

    // Verificar se a categoria existe
    const category = await prisma.categories.findFirst({
      where: { id: category_id, is_active: true }
    })

    if (!category) {
      return res.status(400).json({ message: 'Categoria não encontrada' })
    }

    // Verificar se o autor existe
    const author = await prisma.users.findFirst({
      where: { id: author_id, is_active: true }
    })

    if (!author) {
      return res.status(400).json({ message: 'Autor não encontrado' })
    }

    // Calcular tempo de leitura se não fornecido
    const calculatedReadingTime = reading_time || Math.ceil(content.split(' ').length / 200)

    // Criar o post
    const post = await prisma.posts.create({
      data: {
        title,
        content,
        excerpt,
        slug,
        category_id,
        author_id,
        meta_title,
        meta_description,
        key_word_seo,
        featured_image,
        social_image,
        status,
        is_featured,
        is_pinned,
        reading_time: calculatedReadingTime,
        tags,
        published_at: status === 'published' ? new Date() : null
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
            color: true,
            icon: true
          }
        }
      }
    })

    // Registrar log de criação
    await logCreate(
      author_id,
      'posts',
      post.id,
      post.title,
      post,
      req,
      `Post "${post.title}" criado`
    )

    return res.status(201).json({
      message: 'Post criado com sucesso',
      post
    })

  } catch (error) {
    console.error('Erro ao criar post:', error)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
} 