import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const menuItemId = parseInt(id as string)

  if (isNaN(menuItemId)) {
    return res.status(400).json({ message: 'ID inválido' })
  }

  if (req.method === 'GET') {
    try {
      const menuItem = await prisma.menuItems.findUnique({
        where: { id: menuItemId },
        include: {
          children: {
            where: { is_active: true },
            orderBy: { order: 'asc' }
          }
        }
      })

      if (!menuItem) {
        return res.status(404).json({ message: 'Item do menu não encontrado' })
      }

      return res.status(200).json({ menuItem })
    } catch (error) {
      console.error('❌ Erro ao buscar item do menu:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'PATCH') {
    try {
      console.log('📝 Editando item - dados recebidos:', req.body)
      const { title, url, target, order, is_active } = req.body

      const existingMenuItem = await prisma.menuItems.findUnique({
        where: { id: menuItemId }
      })

      if (!existingMenuItem) {
        console.log('❌ Item não encontrado:', menuItemId)
        return res.status(404).json({ message: 'Item do menu não encontrado' })
      }

      const updateData: {
        title?: string
        url?: string | null
        target?: string
        order?: number
        is_active?: boolean
      } = {}
      
      if (title !== undefined) updateData.title = String(title)
      if (url !== undefined) updateData.url = url ? String(url) : null
      if (target !== undefined) updateData.target = String(target)
      if (order !== undefined) updateData.order = Number(order)
      if (is_active !== undefined) updateData.is_active = Boolean(is_active)
      
      console.log('📝 Dados para atualização:', updateData)

      const updatedMenuItem = await prisma.menuItems.update({
        where: { id: menuItemId },
        data: updateData
      })

      return res.status(200).json({ 
        menuItem: updatedMenuItem,
        message: 'Item do menu atualizado com sucesso'
      })
    } catch (error) {
      console.error('❌ Erro ao atualizar item do menu:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const existingMenuItem = await prisma.menuItems.findUnique({
        where: { id: menuItemId },
        include: {
          _count: {
            select: {
              children: true
            }
          }
        }
      })

      if (!existingMenuItem) {
        return res.status(404).json({ message: 'Item do menu não encontrado' })
      }

      // Verificar se o item tem subitens
      if (existingMenuItem._count.children > 0) {
        return res.status(400).json({ 
          message: 'Não é possível excluir um item que possui subitens. Remova os subitens primeiro.' 
        })
      }

      await prisma.menuItems.delete({
        where: { id: menuItemId }
      })

      return res.status(200).json({ 
        message: 'Item do menu excluído com sucesso'
      })
    } catch (error) {
      console.error('❌ Erro ao excluir item do menu:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}

