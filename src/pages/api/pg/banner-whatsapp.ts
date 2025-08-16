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

      // Validações de tamanho
      if (title.length > 100) {
        return res.status(400).json({ 
          message: 'Título deve ter no máximo 100 caracteres' 
        })
      }

      if (description && description.length > 300) {
        return res.status(400).json({ 
          message: 'Descrição deve ter no máximo 300 caracteres' 
        })
      }

      if (button_text.length > 50) {
        return res.status(400).json({ 
          message: 'Texto do botão deve ter no máximo 50 caracteres' 
        })
      }

      // Validação do link do WhatsApp
      if (!whatsapp_link.startsWith('https://wa.me/')) {
        return res.status(400).json({ 
          message: 'Link do WhatsApp deve começar com https://wa.me/' 
        })
      }

      // Validação da cor (deve ser hex válida)
      if (background_color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(background_color)) {
        return res.status(400).json({ 
          message: 'Cor de background deve ser um valor hexadecimal válido' 
        })
      }

      // Validação da URL da imagem
      if (background_image) {
        try {
          new URL(background_image);
        } catch {
          return res.status(400).json({ 
            message: 'URL da imagem deve ser válida' 
          })
        }
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

      console.log(`[${new Date().toISOString()}] Banner WhatsApp criado:`, {
        id: bannerWhatsApp.id,
        title: bannerWhatsApp.title,
        is_active: bannerWhatsApp.is_active
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

      // Validações de tamanho
      if (title.length > 100) {
        return res.status(400).json({ 
          message: 'Título deve ter no máximo 100 caracteres' 
        })
      }

      if (description && description.length > 300) {
        return res.status(400).json({ 
          message: 'Descrição deve ter no máximo 300 caracteres' 
        })
      }

      if (button_text.length > 50) {
        return res.status(400).json({ 
          message: 'Texto do botão deve ter no máximo 50 caracteres' 
        })
      }

      // Validação do link do WhatsApp
      if (!whatsapp_link.startsWith('https://wa.me/')) {
        return res.status(400).json({ 
          message: 'Link do WhatsApp deve começar com https://wa.me/' 
        })
      }

      // Validação da cor (deve ser hex válida)
      if (background_color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(background_color)) {
        return res.status(400).json({ 
          message: 'Cor de background deve ser um valor hexadecimal válido' 
        })
      }

      // Validação da URL da imagem
      if (background_image) {
        try {
          new URL(background_image);
        } catch {
          return res.status(400).json({ 
            message: 'URL da imagem deve ser válida' 
          })
        }
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

      console.log(`[${new Date().toISOString()}] Banner WhatsApp atualizado:`, {
        id: bannerWhatsApp.id,
        title: bannerWhatsApp.title,
        is_active: bannerWhatsApp.is_active
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

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body

      if (!id) {
        return res.status(400).json({ message: 'ID é obrigatório' })
      }

      // Verificar se o banner existe
      const existingBanner = await prisma.bannerWhatsApp.findUnique({
        where: { id: parseInt(id) }
      })

      if (!existingBanner) {
        return res.status(404).json({ message: 'Banner não encontrado' })
      }

      // Deletar o banner
      await prisma.bannerWhatsApp.delete({
        where: { id: parseInt(id) }
      })

      console.log(`[${new Date().toISOString()}] Banner WhatsApp deletado:`, {
        id: parseInt(id),
        title: existingBanner.title
      })

      return res.status(200).json({
        message: 'Banner deletado com sucesso'
      })

    } catch (error) {
      console.error('Erro ao deletar banner:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
