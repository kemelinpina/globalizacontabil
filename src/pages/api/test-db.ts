import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Testa conexão com o banco
    await prisma.$connect()
    
    // Testa uma query simples
    const fileCount = await prisma.files.count()
    
    return res.status(200).json({
      success: true,
      message: 'Banco funcionando!',
      fileCount,
      database: process.env.DATABASE_URL ? 'Configurado' : 'Não configurado'
    })
    
  } catch (error) {
    console.error('Erro no teste do banco:', error)
    return res.status(500).json({
      success: false,
      error: 'Erro no banco de dados',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
    })
  } finally {
    await prisma.$disconnect()
  }
}
