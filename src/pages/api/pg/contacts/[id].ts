import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const contact = await prisma.contacts.findUnique({
        where: { id: parseInt(id as string) }
      })

      if (!contact) {
        return res.status(404).json({ message: 'Contato não encontrado' })
      }

      return res.status(200).json({ contact })

    } catch (error) {
      console.error('Erro ao buscar contato:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { location, type, title, link, order, custom_color, is_active } = req.body

      // Validações básicas
      if (!location || !type || !link || order === undefined) {
        return res.status(400).json({ 
          message: 'Location, type, link e order são obrigatórios' 
        })
      }

      // Verificar se o contato existe
      const existingContact = await prisma.contacts.findUnique({
        where: { id: parseInt(id as string) }
      })

      if (!existingContact) {
        return res.status(404).json({ message: 'Contato não encontrado' })
      }

      // Verificar se mudou a ordem e se não conflita com outro contato
      if (existingContact.order !== parseInt(order) || existingContact.location !== location) {
        const conflictContact = await prisma.contacts.findUnique({
          where: {
            location_order: {
              location,
              order: parseInt(order)
            }
          }
        })

        if (conflictContact && conflictContact.id !== parseInt(id as string)) {
          return res.status(400).json({ 
            message: `Já existe um contato com ordem ${order} em ${location}` 
          })
        }
      }

      // Atualizar contato
      const updatedContact = await prisma.contacts.update({
        where: { id: parseInt(id as string) },
        data: {
          location,
          type,
          title: title || null,
          link,
          order: parseInt(order),
          custom_color: custom_color || null,
          is_active: is_active !== undefined ? is_active : true
        }
      })

      return res.status(200).json({
        message: 'Contato atualizado com sucesso',
        contact: updatedContact
      })

    } catch (error) {
      console.error('Erro ao atualizar contato:', error)
      
      // Verificar se é erro de constraint unique
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return res.status(400).json({ 
          message: 'Já existe um contato com essa ordem nesta localização' 
        })
      }
      
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Verificar se o contato existe
      const existingContact = await prisma.contacts.findUnique({
        where: { id: parseInt(id as string) }
      })

      if (!existingContact) {
        return res.status(404).json({ message: 'Contato não encontrado' })
      }

      // Deletar contato
      await prisma.contacts.delete({
        where: { id: parseInt(id as string) }
      })

      return res.status(200).json({ message: 'Contato deletado com sucesso' })

    } catch (error) {
      console.error('Erro ao deletar contato:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}

