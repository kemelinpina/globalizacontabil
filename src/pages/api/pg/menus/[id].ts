import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const menuId = parseInt(id as string)

  if (isNaN(menuId)) {
    return res.status(400).json({ message: 'ID inválido' })
  }

  if (req.method === 'GET') {
    try {
      const menu = await prisma.menus.findUnique({
        where: { id: menuId },
        include: {
          menu_items: {
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
      })

      if (!menu) {
        return res.status(404).json({ message: 'Menu não encontrado' })
      }

      return res.status(200).json({ menu })
    } catch (error) {
      console.error('❌ Erro ao buscar menu:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { name, is_active } = req.body

      const existingMenu = await prisma.menus.findUnique({
        where: { id: menuId }
      })

      if (!existingMenu) {
        return res.status(404).json({ message: 'Menu não encontrado' })
      }

      const updateData: {
        name?: string
        location?: string
        is_active?: boolean
      } = {}
      if (name !== undefined) updateData.name = name
      if (is_active !== undefined) updateData.is_active = is_active

      const updatedMenu = await prisma.menus.update({
        where: { id: menuId },
        data: updateData
      })

      return res.status(200).json({ 
        menu: updatedMenu,
        message: 'Menu atualizado com sucesso'
      })
    } catch (error) {
      console.error('❌ Erro ao atualizar menu:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const existingMenu = await prisma.menus.findUnique({
        where: { id: menuId },
        include: {
          _count: {
            select: {
              menu_items: true
            }
          }
        }
      })

      if (!existingMenu) {
        return res.status(404).json({ message: 'Menu não encontrado' })
      }

      // Verificar se o menu tem itens
      if (existingMenu._count.menu_items > 0) {
        return res.status(400).json({ 
          message: 'Não é possível excluir um menu que possui itens. Remova os itens primeiro.' 
        })
      }

      await prisma.menus.delete({
        where: { id: menuId }
      })

      return res.status(200).json({ 
        message: 'Menu excluído com sucesso'
      })
    } catch (error) {
      console.error('❌ Erro ao excluir menu:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}

