import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const postId = parseInt(id as string)

  if (isNaN(postId)) {
    return res.status(400).json({ message: 'ID inválido' })
  }

  if (req.method === 'GET') {
    try {
      const post = await prisma.posts.findUnique({
        where: { id: postId },
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
        }
      })

      if (!post) {
        return res.status(404).json({ message: 'Post não encontrado' })
      }

      return res.status(200).json({ post })
    } catch (error) {
      console.error('Erro ao buscar post:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const {
        title,
        content,
        slug,
        category_id,
        author_id,
        excerpt,
        status,
        meta_title,
        meta_description,
        key_word_seo,
        featured_image,
        social_image,
        is_featured,
        is_pinned,
        reading_time,
        tags,
        published_at
      } = req.body

      // Validações
      if (!title || !content || !slug || !category_id || !author_id) {
        return res.status(400).json({ 
          message: 'Título, conteúdo, slug, categoria e autor são obrigatórios' 
        })
      }

      // Verificar se o slug já existe (exceto para o próprio post)
      const existingPost = await prisma.posts.findFirst({
        where: {
          slug,
          id: { not: postId }
        }
      })

      if (existingPost) {
        return res.status(400).json({ message: 'Slug já existe' })
      }

      // Verificar se a categoria existe
      const category = await prisma.categories.findUnique({
        where: { id: parseInt(category_id) }
      })

      if (!category) {
        return res.status(400).json({ message: 'Categoria não encontrada' })
      }

      // Verificar se o autor existe
      const author = await prisma.users.findUnique({
        where: { id: parseInt(author_id) }
      })

      if (!author) {
        return res.status(400).json({ message: 'Autor não encontrado' })
      }

      // Calcular tempo de leitura se não fornecido
      let calculatedReadingTime = reading_time
      if (!reading_time && content) {
        const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
        calculatedReadingTime = Math.ceil(wordCount / 200) // 200 palavras por minuto
      }

      // Definir data de publicação se status for 'published' e não houver data
      let publishDate = published_at
      if (status === 'published' && !published_at) {
        publishDate = new Date().toISOString()
      }

      const updatedPost = await prisma.posts.update({
        where: { id: postId },
        data: {
          title,
          content,
          slug,
          category_id: parseInt(category_id),
          author_id: parseInt(author_id),
          excerpt: excerpt || '',
          status: status || 'draft',
          meta_title: meta_title || '',
          meta_description: meta_description || '',
          key_word_seo: key_word_seo || '',
          featured_image: featured_image || '',
          social_image: social_image || '',
          is_featured: is_featured || false,
          is_pinned: is_pinned || false,
          reading_time: calculatedReadingTime,
          tags: tags || '',
          published_at: publishDate,
          updated_at: new Date()
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
              name: true
            }
          }
        }
      })

      return res.status(200).json({ 
        message: 'Post atualizado com sucesso',
        post: updatedPost
      })

    } catch (error) {
      console.error('Erro ao atualizar post:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Verificar se o post existe
      const existingPost = await prisma.posts.findUnique({
        where: { id: postId }
      })

      if (!existingPost) {
        return res.status(404).json({ message: 'Post não encontrado' })
      }

      // Deletar o post
      await prisma.posts.delete({
        where: { id: postId }
      })

      return res.status(200).json({ message: 'Post excluído com sucesso' })

    } catch (error) {
      console.error('Erro ao excluir post:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
