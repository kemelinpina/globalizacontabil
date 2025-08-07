import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

interface WhereClause {
  is_active?: boolean
  OR?: Array<{
    name?: { contains: string }
    email?: { contains: string }
  }>
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { 
        page = '1', 
        limit = '10', 
        search,
        is_active
      } = req.query

      const pageNumber = parseInt(page as string)
      const limitNumber = parseInt(limit as string)
      const skip = (pageNumber - 1) * limitNumber

      // Construir where clause
      const where: WhereClause = {}
      
      if (is_active !== undefined) {
        where.is_active = is_active === 'true'
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search as string } },
          { email: { contains: search as string } },
        ]
      }

      // Buscar usuários
      const users = await prisma.users.findMany({
        where,
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limitNumber
      })

      // Contar total de usuários para paginação
      const total = await prisma.users.count({ where })

      return res.status(200).json({
        users,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          pages: Math.ceil(total / limitNumber)
        }
      })

    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, email, password, super_adm, is_active } = req.body

      // Validações
      if (!name || !email || !password) {
        return res.status(400).json({ 
          message: 'Nome, email e senha são obrigatórios' 
        })
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          message: 'Senha deve ter pelo menos 6 caracteres' 
        })
      }

      // Verificar se o email já existe
      const existingUser = await prisma.users.findUnique({
        where: { email }
      })

      if (existingUser) {
        return res.status(400).json({ 
          message: 'Email já está em uso' 
        })
      }

      // Criptografar senha
      const hashedPassword = await bcrypt.hash(password, 10)

      // Criar usuário
      const newUser = await prisma.users.create({
        data: {
          name: name.trim(),
          email: email.trim(),
          password: hashedPassword,
          super_adm: super_adm || false,
          is_active: is_active !== undefined ? is_active : true
        }
      })

      // Retornar usuário sem a senha
      const { password: _, ...userWithoutPassword } = newUser

      return res.status(201).json({
        user: userWithoutPassword,
        message: 'Usuário criado com sucesso'
      })

    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
