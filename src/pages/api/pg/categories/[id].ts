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
        color = "#013F71",
        icon,
        is_active = true
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

      // Validar formato da cor (hexadecimal) - mais flexível
      let validColor = color
      if (typeof color === 'object' && color.toHexString) {
        // Se for um objeto do ColorPicker, extrair o valor hex
        validColor = color.toHexString()
      } else if (typeof color === 'string') {
        // Se for string, verificar se é um hex válido
        const colorRegex = /^#[0-9A-F]{6}$/i
        if (!colorRegex.test(color)) {
          return res.status(400).json({ 
            message: 'Cor deve estar no formato hexadecimal (ex: #013F71)' 
          })
        }
        validColor = color
      } else {
        // Valor padrão se não for válido
        validColor = "#013F71"
      }

      // Validar formato do ícone (se fornecido)
      if (icon) {
        const allowedExtensions = ['.png', '.svg', '.webp', '.jpg', '.jpeg']
        const iconExtension = icon.toLowerCase().split('.').pop()
        
        if (!iconExtension || !allowedExtensions.includes(`.${iconExtension}`)) {
          return res.status(400).json({ 
            message: 'Ícone deve ser um arquivo PNG, SVG, WebP, JPG ou JPEG' 
          })
        }
      }

      // Atualizar a categoria
      const category = await prisma.categories.update({
        where: { id: categoryId },
        data: {
          name,
          color,
          icon,
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