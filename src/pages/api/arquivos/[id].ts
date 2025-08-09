import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { deleteFromCloudinary } from '../../../lib/cloudinary'

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

      // Deletar do Cloudinary se tiver cloudinary_id
      if (file.cloudinary_id) {
        try {
          await deleteFromCloudinary(file.cloudinary_id)
        } catch (error) {
          console.error('Erro ao deletar do Cloudinary:', error)
          // Continua mesmo se der erro no Cloudinary
        }
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
