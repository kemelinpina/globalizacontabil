import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getTableDisplayName, getActionDisplayName } from '../../../utils/logService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    // Parâmetros de consulta
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const search = req.query.search as string
    const action = req.query.action as string
    const tableName = req.query.table_name as string
    const userId = req.query.user_id as string
    const startDate = req.query.start_date as string
    const endDate = req.query.end_date as string

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}

    if (search) {
      where.OR = [
        { record_name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (action) {
      where.action = action
    }

    if (tableName) {
      where.table_name = tableName
    }

    if (userId) {
      where.user_id = parseInt(userId)
    }

    if (startDate) {
      where.created_at = {
        ...where.created_at,
        gte: new Date(startDate)
      }
    }

    if (endDate) {
      where.created_at = {
        ...where.created_at,
        lte: new Date(endDate + 'T23:59:59.999Z')
      }
    }

    // Buscar logs
    const [logs, total] = await Promise.all([
      prisma.logs.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.logs.count({ where })
    ])

    // Formatar dados para exibição
    const formattedLogs = logs.map(log => ({
      ...log,
      action_display: getActionDisplayName(log.action),
      table_display: getTableDisplayName(log.table_name),
      old_data: log.old_data ? JSON.parse(log.old_data) : null,
      new_data: log.new_data ? JSON.parse(log.new_data) : null,
      created_at_formatted: new Date(log.created_at).toLocaleString('pt-BR')
    }))

    return res.status(200).json({
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar logs:', error)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
}
