import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../../../lib/prisma';

// Configuração do Multer para armazenamento local
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const basePath = '/var/www/html/uploads_globaliza';
      
      // Cria pasta principal se não existir
      if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath, { recursive: true });
      }
      
      cb(null, basePath);
    },
    filename: (req, file, cb) => {
      // Nome único: timestamp + nome original limpo
      const timestamp = Date.now();
      const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      cb(null, `${timestamp}_${originalName}`);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    // Permite todos os tipos de arquivo
    cb(null, true);
  }
});

// Middleware para processar o upload
const uploadMiddleware = upload.array('files');

// Função para executar o middleware do Multer
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Executa o middleware de upload
    await runMiddleware(req, res, uploadMiddleware);

    // Verifica se há arquivos
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const uploadedFiles = [];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://seudominio.com';

    // Processa cada arquivo
    for (const file of req.files as any[]) {
      try {
        // Constrói a URL de acesso
        const fileName = path.basename(file.path);
        const fileUrl = `${baseUrl}/uploads_globaliza/${fileName}`;
        
        // Salva no banco de dados
        const dbFile = await prisma.files.create({
          data: {
            url: fileUrl,
            name: file.originalname,
            size: file.size,
            type: file.mimetype,
            path: file.path,
            subFolder: null // Não usamos mais subpastas
          }
        });

        uploadedFiles.push({
          id: dbFile.id,
          originalName: file.originalname,
          fileName: fileName,
          url: fileUrl,
          size: file.size,
          type: file.mimetype,
          subFolder: null
        });

      } catch (fileError) {
        console.error('Erro ao processar arquivo:', fileError);
        // Continua com outros arquivos mesmo se um falhar
      }
    }

    if (uploadedFiles.length === 0) {
      return res.status(500).json({ error: 'Falha ao processar todos os arquivos' });
    }

    // Retorna sucesso
    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`,
      files: uploadedFiles,
      // Para compatibilidade com código existente
      url: uploadedFiles[0]?.url
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    
    // Log mais detalhado para debug
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
    });
  }
}

// Configuração para desabilitar o body parser padrão do Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};
