import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Buscar o banner ativo
      const bannerWhatsApp = await prisma.bannerWhatsApp.findFirst({
        where: { is_active: true },
        orderBy: { updated_at: 'desc' }
      })

      return res.status(200).json({
        bannerWhatsApp: bannerWhatsApp || null
      })

    } catch (error) {
      console.error('Erro ao buscar banner WhatsApp:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { 
        title, 
        description, 
        button_text, 
        whatsapp_link, 
        background_image, 
        background_color, 
        is_active 
      } = req.body

      // Validações básicas
      if (!title || !button_text || !whatsapp_link) {
        return res.status(400).json({ 
          message: 'Título, texto do botão e link do WhatsApp são obrigatórios' 
        })
      }

      // Desativar outros registros ativos se este for ativo
      if (is_active !== false) {
        await prisma.bannerWhatsApp.updateMany({
          where: { is_active: true },
          data: { is_active: false }
        })
      }

      // Criar novo banner
      const bannerWhatsApp = await prisma.bannerWhatsApp.create({
        data: {
          title,
          description: description || null,
          button_text,
          whatsapp_link,
          background_image: background_image || null,
          background_color: background_color || '#013F71',
          is_active: is_active !== false
        }
      })

      return res.status(201).json({
        message: 'Banner criado com sucesso',
        bannerWhatsApp
      })

    } catch (error) {
      console.error('Erro ao criar banner:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { 
        id,
        title, 
        description, 
        button_text, 
        whatsapp_link, 
        background_image, 
        background_color, 
        is_active 
      } = req.body

      if (!id) {
        return res.status(400).json({ message: 'ID é obrigatório' })
      }

      // Validações básicas
      if (!title || !button_text || !whatsapp_link) {
        return res.status(400).json({ 
          message: 'Título, texto do botão e link do WhatsApp são obrigatórios' 
        })
      }

      // Desativar outros registros ativos se este for ativo
      if (is_active !== false) {
        await prisma.bannerWhatsApp.updateMany({
          where: { 
            is_active: true,
            id: { not: parseInt(id) }
          },
          data: { is_active: false }
        })
      }

      // Atualizar banner
      const bannerWhatsApp = await prisma.bannerWhatsApp.update({
        where: { id: parseInt(id) },
        data: {
          title,
          description: description || null,
          button_text,
          whatsapp_link,
          background_image: background_image || null,
          background_color: background_color || '#013F71',
          is_active: is_active !== false
        }
      })

      return res.status(200).json({
        message: 'Banner atualizado com sucesso',
        bannerWhatsApp
      })

    } catch (error) {
      console.error('Erro ao atualizar banner:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
