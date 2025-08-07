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
      url,
      favorite = false,
      is_main = false,
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

    // Verificar se a URL já existe (se fornecida)
    if (url) {
      const existingUrl = await prisma.categories.findFirst({
        where: { url }
      })

      if (existingUrl) {
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
        url,
        favorite,
        is_main,
        is_active,
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