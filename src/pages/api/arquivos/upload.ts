import { NextApiRequest, NextApiResponse } from 'next'
import multer from 'multer'
import { prisma } from '../../../lib/prisma'
import { uploadToCloudinary } from '../../../lib/cloudinary'

// Configurar multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Permitir todos os tipos de arquivo
    cb(null, true)
  }
})

// Configurar multer para Next.js
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Executar middleware do multer
    await runMiddleware(req, res, upload.single('file'))

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo foi enviado' })
    }

    // Upload para Cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      'globalizacontabil'
    )

    // Salvar informações do arquivo no banco
    const fileRecord = await prisma.files.create({
      data: {
        name: req.file.originalname,
        url: cloudinaryResult.secure_url,
        size: cloudinaryResult.bytes,
        type: req.file.mimetype,
        cloudinary_id: cloudinaryResult.public_id
      }
    })

    return res.status(200).json({
      message: 'Arquivo enviado com sucesso',
      file: {
        id: fileRecord.id,
        name: fileRecord.name,
        url: fileRecord.url,
        size: fileRecord.size,
        type: fileRecord.type,
        cloudinary_id: cloudinaryResult.public_id
      }
    })

  } catch (error) {
    console.error('Erro no upload:', error)
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Erro interno do servidor' 
    })
  }
}

// Configurar para aceitar arquivos
export const config = {
  api: {
    bodyParser: false,
  },
}
