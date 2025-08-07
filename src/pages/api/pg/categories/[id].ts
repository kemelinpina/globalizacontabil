import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const categoryId = parseInt(id as string)

  if (isNaN(categoryId)) {
    return res.status(400).json({ message: 'ID inválido' })
  }

  if (req.method === 'PUT') {
    try {
      const {
        name,
        description,
        url,
        favorite,
        is_main,
        is_active
      } = req.body

      // Validações básicas
      if (!name) {
        return res.status(400).json({ message: 'Nome da categoria é obrigatório' })
      }

      // Verificar se a categoria existe
      const existingCategory = await prisma.categories.findFirst({
        where: { id: categoryId }
      })

      if (!existingCategory) {
        return res.status(404).json({ message: 'Categoria não encontrada' })
      }

      // Verificar se o nome já existe (exceto para a categoria atual)
      const duplicateName = await prisma.categories.findFirst({
        where: {
          name,
          id: { not: categoryId }
        }
      })

      if (duplicateName) {
        return res.status(400).json({ message: 'Categoria com este nome já existe' })
      }

      // Verificar se a URL já existe (se fornecida)
      if (url) {
        const duplicateUrl = await prisma.categories.findFirst({
          where: {
            url,
            id: { not: categoryId }
          }
        })

        if (duplicateUrl) {
          return res.status(400).json({ message: 'URL já existe. Escolha outra.' })
        }

        // Validar formato da URL (apenas letras, números, hífens e underscores)
        const urlRegex = /^[a-z0-9-]+$/
        if (!urlRegex.test(url)) {
          return res.status(400).json({ 
            message: 'URL deve conter apenas letras minúsculas, números, hífens e underscores' 
          })
        }
      }

      // Atualizar a categoria
      const category = await prisma.categories.update({
        where: { id: categoryId },
        data: {
          name,
          description,
          url,
          favorite,
          is_main,
          is_active
        }
      })

      return res.status(200).json({
        message: 'Categoria atualizada com sucesso',
        category
      })

    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Verificar se a categoria existe
      const existingCategory = await prisma.categories.findFirst({
        where: { id: categoryId },
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        }
      })

      if (!existingCategory) {
        return res.status(404).json({ message: 'Categoria não encontrada' })
      }

      // Verificar se há posts associados
      if (existingCategory._count.posts > 0) {
        return res.status(400).json({ 
          message: 'Não é possível excluir uma categoria que possui posts associados' 
        })
      }

      // Excluir a categoria
      await prisma.categories.delete({
        where: { id: categoryId }
      })

      return res.status(200).json({
        message: 'Categoria excluída com sucesso'
      })

    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
} 