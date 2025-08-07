import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

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

    // Verificar se o nome já existe
    const existingCategory = await prisma.categories.findFirst({
      where: { name }
    })

    if (existingCategory) {
      return res.status(400).json({ message: 'Categoria com este nome já existe' })
    }

    // Validar formato da cor (hexadecimal)
    const colorRegex = /^#[0-9A-F]{6}$/i
    if (!colorRegex.test(color)) {
      return res.status(400).json({ 
        message: 'Cor deve estar no formato hexadecimal (ex: #013F71)' 
      })
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

    // Criar a categoria
    const category = await prisma.categories.create({
      data: {
        name,
        color,
        icon,
        is_active
      }
    })

    return res.status(201).json({
      message: 'Categoria criada com sucesso',
      category
    })

  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
} 