import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { slug } = req.query

      const page = await prisma.pages.findUnique({
        where: { 
          slug: slug as string,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      if (!page) {
        return res.status(404).json({ message: 'Página não encontrada' })
      }

      // Apenas páginas publicadas podem ser visualizadas publicamente
      if (page.status !== 'published') {
        return res.status(404).json({ message: 'Página não encontrada' })
      }

      // Incrementar visualizações
      await prisma.pages.update({
        where: { id: page.id },
        data: { view_count: { increment: 1 } }
      })

      return res.status(200).json({ page })

    } catch (error) {
      console.error('Erro ao buscar página:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
