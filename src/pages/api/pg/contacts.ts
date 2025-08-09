import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { location, type, active, page = '1', limit = '20' } = req.query

      const pageNumber = parseInt(page as string)
      const limitNumber = parseInt(limit as string)
      const skip = (pageNumber - 1) * limitNumber

      // Construir where clause
      const where: {
        location?: string
        type?: string
        is_active?: boolean
      } = {}
      
      if (location) {
        where.location = location as string
      }
      
      if (type) {
        where.type = type as string
      }

      if (active !== undefined) {
        where.is_active = active === 'true'
      }

      // Buscar contatos
      const contacts = await prisma.contacts.findMany({
        where,
        orderBy: [
          { location: 'asc' },
          { order: 'asc' }
        ],
        skip,
        take: limitNumber
      })

      // Contar total de contatos
      const total = await prisma.contacts.count({ where })

      return res.status(200).json({
        contacts,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          pages: Math.ceil(total / limitNumber)
        }
      })

    } catch (error) {
      console.error('Erro ao buscar contatos:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { location, type, title, link, order, custom_color, is_active } = req.body

      // Validações básicas
      if (!location || !type || !link || order === undefined) {
        return res.status(400).json({ 
          message: 'Location, type, link e order são obrigatórios' 
        })
      }

      // Verificar se já existe um contato com a mesma ordem na mesma location
      const existingContact = await prisma.contacts.findUnique({
        where: {
          location_order: {
            location,
            order: parseInt(order)
          }
        }
      })

      if (existingContact) {
        return res.status(400).json({ 
          message: `Já existe um contato com ordem ${order} em ${location}` 
        })
      }

      // Criar contato
      const contact = await prisma.contacts.create({
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

      return res.status(201).json({
        message: 'Contato criado com sucesso',
        contact
      })

    } catch (error) {
      console.error('Erro ao criar contato:', error)
      
      // Verificar se é erro de constraint unique
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return res.status(400).json({ 
          message: 'Já existe um contato com essa ordem nesta localização' 
        })
      }
      
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
