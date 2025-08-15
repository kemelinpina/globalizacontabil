import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../../../lib/prisma';

// Tipos para o Multer
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// Extendendo NextApiRequest para incluir files
interface ExtendedNextApiRequest extends NextApiRequest {
  files?: MulterFile[];
}

// Configuração do Multer para armazenamento local
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Pasta externa no servidor (fora do projeto)
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
function runMiddleware(req: ExtendedNextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    console.log('🚀 Iniciando upload...');
    
    // Executa o middleware de upload
    console.log('📁 Executando middleware de upload...');
    await runMiddleware(req, res, uploadMiddleware);
    console.log('✅ Middleware executado com sucesso');

    // Verifica se há arquivos
    if (!req.files || req.files.length === 0) {
      console.log('❌ Nenhum arquivo recebido');
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    console.log(`📋 ${req.files.length} arquivo(s) recebido(s)`);
    const uploadedFiles: any[] = [];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://globalizacontabil.com.br';

    // Processa cada arquivo
    for (const file of req.files) {
      try {
        console.log(`📄 Processando arquivo: ${file.originalname}`);
        
        // Constrói a URL de acesso
        const fileName = path.basename(file.path);
        const fileUrl = `${baseUrl}/uploads_globaliza/${fileName}`;
        console.log(`🔗 URL gerada: ${fileUrl}`);
        
        // Salva no banco de dados
        console.log('💾 Salvando no banco...');
        const dbFile = await prisma.files.create({
          data: {
            url: fileUrl,
            name: file.originalname,
            size: file.size,
            type: file.mimetype
            // Removidos campos path e subFolder que não existem no banco
          }
        });
        console.log(`✅ Arquivo salvo no banco com ID: ${dbFile.id}`);

        uploadedFiles.push({
          id: dbFile.id,
          originalName: file.originalname,
          fileName: fileName,
          url: fileUrl,
          size: file.size,
          type: file.mimetype
          // Removidos campos path e subFolder
        });

      } catch (fileError) {
        console.error('❌ Erro ao processar arquivo:', fileError);
        // Continua com outros arquivos mesmo se um falhar
      }
    }

    if (uploadedFiles.length === 0) {
      console.log('❌ Nenhum arquivo foi processado com sucesso');
      return res.status(500).json({ error: 'Falha ao processar todos os arquivos' });
    }

    console.log(`🎉 ${uploadedFiles.length} arquivo(s) processado(s) com sucesso`);
    
    // Retorna sucesso
    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`,
      files: uploadedFiles,
      url: uploadedFiles[0]?.url
    });

  } catch (error) {
    console.error('💥 Erro geral no upload:', error);
    
    // Log mais detalhado para debug
    if (error instanceof Error) {
      console.error('📚 Stack trace:', error.stack);
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
