import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { location, search, include_items } = req.query

      const where: any = {}
      if (location) {
        where.location = location
      }
      
      if (search) {
        where.name = {
          contains: search as string,
          mode: 'insensitive'
        }
      }

      const includeOptions: any = {
        _count: {
          select: {
            menu_items: true
          }
        }
      }

      // Se solicitado, incluir os itens do menu
      if (include_items === 'true') {
        includeOptions.menu_items = {
          where: { parent_id: null }, // Apenas itens principais
          orderBy: { order: 'asc' },
          include: {
            children: {
              orderBy: { order: 'asc' },
              include: {
                children: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        }
      }

      const menus = await prisma.menus.findMany({
        where,
        include: includeOptions,
        orderBy: { created_at: 'desc' }
      })

      return res.status(200).json({ menus })
    } catch (error) {
      console.error('❌ Erro ao buscar menus:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, location } = req.body

      if (!name || !location) {
        return res.status(400).json({ 
          message: 'Nome e localização são obrigatórios' 
        })
      }

      // Verificar se já existe um menu para esta localização
      const existingMenu = await prisma.menus.findFirst({
        where: { location }
      })

      if (existingMenu) {
        return res.status(400).json({ 
          message: 'Já existe um menu para esta localização' 
        })
      }

      const menu = await prisma.menus.create({
        data: {
          name,
          location
        }
      })

      return res.status(201).json({ 
        menu,
        message: 'Menu criado com sucesso'
      })
    } catch (error) {
      console.error('❌ Erro ao criar menu:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}

