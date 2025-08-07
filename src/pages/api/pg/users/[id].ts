import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const userId = parseInt(id as string)

  if (isNaN(userId)) {
    return res.status(400).json({ message: 'ID inválido' })
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              posts: true
            }
          },
          posts: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              created_at: true,
              category: {
                select: {
                  name: true
                }
              }
            },
            orderBy: {
              created_at: 'desc'
            },
            take: 5
          }
        }
      })

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' })
      }

      return res.status(200).json({ user })
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { name, email, password, super_adm, is_active } = req.body

      // Verificar se o usuário existe
      const existingUser = await prisma.users.findUnique({
        where: { id: userId }
      })

      if (!existingUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' })
      }

      // Verificar se o email já existe (se foi alterado)
      if (email && email !== existingUser.email) {
        const emailExists = await prisma.users.findUnique({
          where: { email }
        })

        if (emailExists) {
          return res.status(400).json({ message: 'Email já está em uso' })
        }
      }

      // Preparar dados para atualização
      const updateData: any = {
        ...(name && { name }),
        ...(email && { email }),
        ...(typeof super_adm !== 'undefined' && { super_adm }),
        ...(typeof is_active !== 'undefined' && { is_active })
      }

      // Se uma nova senha foi fornecida, criptografá-la
      if (password) {
        if (password.length < 6) {
          return res.status(400).json({ 
            message: 'Senha deve ter pelo menos 6 caracteres' 
          })
        }
        updateData.password = await bcrypt.hash(password, 10)
      }

      // Atualizar usuário
      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: updateData
      })

      // Retornar usuário sem a senha
      const { password: _, ...userWithoutPassword } = updatedUser

      return res.status(200).json({ 
        user: userWithoutPassword,
        message: 'Usuário atualizado com sucesso'
      })
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Verificar se o usuário existe
      const existingUser = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        }
      })

      if (!existingUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' })
      }

      // Verificar se o usuário tem posts
      if (existingUser._count.posts > 0) {
        return res.status(400).json({ 
          message: 'Não é possível excluir um usuário que possui posts. Transfira os posts para outro usuário primeiro.' 
        })
      }

      // Excluir usuário
      await prisma.users.delete({
        where: { id: userId }
      })

      return res.status(200).json({ 
        message: 'Usuário excluído com sucesso'
      })
    } catch (error) {
      console.error('❌ Erro ao excluir usuário:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
