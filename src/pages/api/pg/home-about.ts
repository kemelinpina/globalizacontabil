import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Buscar o conteúdo ativo da seção sobre
      const homeAbout = await prisma.homeAbout.findFirst({
        where: { is_active: true },
        orderBy: { updated_at: 'desc' }
      })

      return res.status(200).json({
        homeAbout: homeAbout || null
      })

    } catch (error) {
      console.error('Erro ao buscar conteúdo da seção sobre:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, content, photo, download_button_text, download_file, is_active } = req.body

      // Validações básicas
      if (!title || !content) {
        return res.status(400).json({ 
          message: 'Título e conteúdo são obrigatórios' 
        })
      }

      // Desativar outros registros ativos se este for ativo
      if (is_active !== false) {
        await prisma.homeAbout.updateMany({
          where: { is_active: true },
          data: { is_active: false }
        })
      }

      // Criar novo conteúdo
      const homeAbout = await prisma.homeAbout.create({
        data: {
          title,
          content,
          photo: photo || null,
          download_button_text: download_button_text || 'Baixe o novo material',
          download_file: download_file || null,
          is_active: is_active !== false
        }
      })

      return res.status(201).json({
        message: 'Conteúdo criado com sucesso',
        homeAbout
      })

    } catch (error) {
      console.error('Erro ao criar conteúdo:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, title, content, photo, download_button_text, download_file, is_active } = req.body

      if (!id) {
        return res.status(400).json({ message: 'ID é obrigatório' })
      }

      // Validações básicas
      if (!title || !content) {
        return res.status(400).json({ 
          message: 'Título e conteúdo são obrigatórios' 
        })
      }

      // Desativar outros registros ativos se este for ativo
      if (is_active !== false) {
        await prisma.homeAbout.updateMany({
          where: { 
            is_active: true,
            id: { not: parseInt(id) }
          },
          data: { is_active: false }
        })
      }

      // Atualizar conteúdo
      const homeAbout = await prisma.homeAbout.update({
        where: { id: parseInt(id) },
        data: {
          title,
          content,
          photo: photo || null,
          download_button_text: download_button_text || 'Baixe o novo material',
          download_file: download_file || null,
          is_active: is_active !== false
        }
      })

      return res.status(200).json({
        message: 'Conteúdo atualizado com sucesso',
        homeAbout
      })

    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
