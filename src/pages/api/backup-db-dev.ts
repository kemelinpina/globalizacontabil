import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Tenta diferentes caminhos do banco de dados
    let dbPath = '';
    
    // Primeiro tenta o caminho de produção
    const prodPath = '/var/www/html/globalizacontabil/storage/dev.db';
    // Depois tenta o caminho relativo (desenvolvimento)
    const devPath = path.join(process.cwd(), 'prisma', 'dev.db');
    
    if (fs.existsSync(prodPath)) {
      dbPath = prodPath;
    } else if (fs.existsSync(devPath)) {
      dbPath = devPath;
    } else {
      return res.status(404).json({ 
        error: 'Banco de dados não encontrado',
        pathsChecked: [prodPath, devPath]
      });
    }

    // Nome do arquivo de backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup_dev_db_${timestamp}.db`;
    
    // Cria o diretório de backup se não existir
    const backupDir = path.join(process.cwd(), 'public', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(backupDir, backupFileName);

    // Copia o arquivo do banco para o diretório de backup
    fs.copyFileSync(dbPath, backupPath);

    // Configura os headers para download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${backupFileName}"`);
    res.setHeader('Content-Length', fs.statSync(backupPath).size);

    // Cria stream de leitura e envia o arquivo
    const stream = fs.createReadStream(backupPath);
    
    stream.pipe(res);

    // Remove o arquivo temporário após o envio
    stream.on('end', () => {
      try {
        fs.unlinkSync(backupPath);
        console.log(`Backup criado e enviado com sucesso: ${backupFileName}`);
        console.log(`Banco de dados copiado de: ${dbPath}`);
      } catch (unlinkError) {
        console.error('Erro ao remover arquivo temporário:', unlinkError);
      }
    });

    stream.on('error', (err) => {
      console.error('Erro ao enviar o arquivo:', err);
      res.status(500).end();
    });

  } catch (error) {
    console.error('Erro ao criar backup:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao criar backup' });
  }
}
