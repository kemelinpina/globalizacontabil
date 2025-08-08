import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import emailService from '../../../utils/emailService'

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

      // Criar usuário (retornando sem o campo de senha)
      const newUser = await prisma.users.create({
        data: {
          name: name.trim(),
          email: email.trim(),
          password: hashedPassword,
          super_adm: super_adm || false,
          is_active: is_active !== undefined ? is_active : true
        },
        select: {
          id: true,
          name: true,
          email: true,
          super_adm: true,
          picture: true,
          is_active: true,
          created_at: true,
          updated_at: true
        }
      })

      // Usuário já retornado sem o campo de senha via select acima

      // Enviar email de boas-vindas para o novo usuário
      try {
        await emailService.sendWelcomeEmail(newUser.email, newUser.name)
        console.log('Email de boas-vindas enviado para:', newUser.email)
      } catch (emailError) {
        console.error('Erro ao enviar email de boas-vindas:', emailError)
        // Não falhar a criação do usuário se o email falhar
      }

      // Buscar administradores e enviar notificação
      try {
        const admins = await prisma.users.findMany({
          where: {
            super_adm: true,
            is_active: true
          },
          select: {
            email: true
          }
        })

        if (admins.length > 0) {
          const adminEmails = admins.map(admin => admin.email)
          await emailService.sendAdminNotification(adminEmails, newUser.name, newUser.email)
          console.log('Notificação enviada para administradores:', adminEmails)
        }
      } catch (adminEmailError) {
        console.error('Erro ao enviar notificação para administradores:', adminEmailError)
        // Não falhar a criação do usuário se a notificação falhar
      }

      return res.status(201).json({
        user: newUser,
        message: 'Usuário criado com sucesso'
      })

    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
