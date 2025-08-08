import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import path from 'path'
import fs from 'fs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'DELETE') {
    try {
      // Buscar o arquivo no banco
      const file = await prisma.files.findUnique({
        where: { id: parseInt(id as string) }
      })

      if (!file) {
        return res.status(404).json({ message: 'Arquivo não encontrado' })
      }

      // Deletar o arquivo físico
      const filePath = path.join(process.cwd(), 'public', file.url)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }

      // Deletar o registro do banco
      await prisma.files.delete({
        where: { id: parseInt(id as string) }
      })

      return res.status(200).json({ message: 'Arquivo deletado com sucesso' })

    } catch (error) {
      console.error('Erro ao deletar arquivo:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
