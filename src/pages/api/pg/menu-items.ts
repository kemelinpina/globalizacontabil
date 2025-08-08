import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { menu_id } = req.query

      if (!menu_id) {
        return res.status(400).json({ message: 'ID do menu é obrigatório' })
      }

      const menuItems = await prisma.menuItems.findMany({
        where: {
          menu_id: parseInt(menu_id as string),
          parent_id: null // Apenas itens principais
        },
        include: {
          children: {
            where: { is_active: true },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      })

      return res.status(200).json({ menuItems })
    } catch (error) {
      console.error('❌ Erro ao buscar itens do menu:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      console.log('📥 Dados recebidos na API:', req.body)
      
      const { menu_id, parent_id, title, url, target, order, is_active } = req.body

      if (!menu_id || !title) {
        console.log('❌ Validação falhou:', { menu_id, title })
        return res.status(400).json({ 
          message: 'ID do menu e título são obrigatórios' 
        })
      }

      const menuData = {
        menu_id: Number(menu_id),
        parent_id: parent_id ? Number(parent_id) : null,
        title: String(title),
        url: url ? String(url) : null,
        target: target ? String(target) : '_self',
        order: order ? Number(order) : 0,
        is_active: Boolean(is_active !== false)
      }
      
      console.log('💾 Dados para o Prisma:', menuData)

      const menuItem = await prisma.menuItems.create({
        data: menuData
      })

      return res.status(201).json({ 
        menuItem,
        message: 'Item do menu criado com sucesso'
      })
    } catch (error) {
      console.error('❌ Erro ao criar item do menu:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}

