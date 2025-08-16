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

      console.log('🔍 API GET - Dados encontrados:', {
        hasData: !!homeAbout,
        id: homeAbout?.id,
        title: homeAbout?.title,
        hasPhoto: !!homeAbout?.photo,
        hasDownloadFile: !!homeAbout?.download_file,
        downloadFile: homeAbout?.download_file,
        downloadButtonText: homeAbout?.download_button_text,
        isActive: homeAbout?.is_active
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

      // Validações de tamanho
      if (title.length > 100) {
        return res.status(400).json({ 
          message: 'Título deve ter no máximo 100 caracteres' 
        })
      }

      if (download_button_text && download_button_text.length > 50) {
        return res.status(400).json({ 
          message: 'Texto do botão deve ter no máximo 50 caracteres' 
        })
      }

      // Validação da URL da foto
      if (photo) {
        try {
          new URL(photo);
        } catch {
          return res.status(400).json({ 
            message: 'URL da foto deve ser válida' 
          })
        }
      }

      // Validação da URL do arquivo
      if (download_file) {
        try {
          new URL(download_file);
        } catch {
          return res.status(400).json({ 
            message: 'URL do arquivo deve ser válida' 
          })
        }
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

      console.log(`[${new Date().toISOString()}] Home About criado:`, {
        id: homeAbout.id,
        title: homeAbout.title,
        hasPhoto: !!homeAbout.photo,
        hasFile: !!homeAbout.download_file,
        is_active: homeAbout.is_active
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

      console.log('🔍 API PUT - Dados recebidos:', {
        id,
        title,
        hasContent: !!content,
        hasPhoto: !!photo,
        hasDownloadFile: !!download_file,
        downloadFile: download_file,
        downloadButtonText: download_button_text,
        isActive: is_active
      })

      if (!id) {
        return res.status(400).json({ message: 'ID é obrigatório' })
      }

      // Validações básicas
      if (!title || !content) {
        return res.status(400).json({ 
          message: 'Título e conteúdo são obrigatórios' 
        })
      }

      // Validações de tamanho
      if (title.length > 100) {
        return res.status(400).json({ 
          message: 'Título deve ter no máximo 100 caracteres' 
        })
      }

      if (download_button_text && download_button_text.length > 50) {
        return res.status(400).json({ 
          message: 'Texto do botão deve ter no máximo 50 caracteres' 
        })
      }

      // Validação da URL da foto
      if (photo) {
        try {
          new URL(photo);
        } catch {
          return res.status(400).json({ 
            message: 'URL da foto deve ser válida' 
          })
        }
      }

      // Validação da URL do arquivo
      if (download_file) {
        try {
          new URL(download_file);
        } catch {
          return res.status(400).json({ 
            message: 'URL do arquivo deve ser válida' 
          })
        }
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

      console.log(`[${new Date().toISOString()}] Home About atualizado:`, {
        id: homeAbout.id,
        title: homeAbout.title,
        hasPhoto: !!homeAbout.photo,
        hasFile: !!homeAbout.download_file,
        is_active: homeAbout.is_active
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

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body

      if (!id) {
        return res.status(400).json({ message: 'ID é obrigatório' })
      }

      // Verificar se o conteúdo existe
      const existingContent = await prisma.homeAbout.findUnique({
        where: { id: parseInt(id) }
      })

      if (!existingContent) {
        return res.status(404).json({ message: 'Conteúdo não encontrado' })
      }

      // Deletar o conteúdo
      await prisma.homeAbout.delete({
        where: { id: parseInt(id) }
      })

      console.log(`[${new Date().toISOString()}] Home About deletado:`, {
        id: parseInt(id),
        title: existingContent.title
      })

      return res.status(200).json({
        message: 'Conteúdo deletado com sucesso'
      })

    } catch (error) {
      console.error('Erro ao deletar conteúdo:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
