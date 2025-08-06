import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { 
      name, 
      description, 
      description_seo, 
      key_word_seo, 
      url, 
      favorite = false,
      is_main = false
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

    // Verificar se a URL já existe (se fornecida)
    if (url) {
      const existingUrl = await prisma.categories.findFirst({
        where: { url }
      })

      if (existingUrl) {
        return res.status(400).json({ message: 'URL já existe. Escolha outra.' })
      }
    }

    // Pegar a última ordem
    const lastOrder = await prisma.categories.findFirst({
      orderBy: { order: 'desc' }
    })

    const newOrder = lastOrder ? lastOrder.order + 1 : 1

    // Criar a categoria
    const category = await prisma.categories.create({
      data: {
        name,
        description,
        description_seo,
        key_word_seo,
        url,
        favorite,
        is_main,
        is_active: true,
        order: newOrder
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