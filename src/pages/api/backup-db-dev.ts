import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';

/**
 * Backup do banco PostgreSQL via pg_dump (dev e producao usam a mesma DATABASE_URL).
 * Requer pg_dump disponivel no PATH do servidor.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return res.status(500).json({ error: 'DATABASE_URL não configurada' });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `backup_globaliza_${timestamp}.sql`;

  res.setHeader('Content-Type', 'application/sql');
  res.setHeader('Content-Disposition', `attachment; filename="${backupFileName}"`);

  const dump = spawn('pg_dump', ['--no-owner', '--no-privileges', databaseUrl]);

  dump.stdout.pipe(res);

  let stderr = '';
  dump.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  dump.on('error', (err) => {
    console.error('Erro ao executar pg_dump:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'pg_dump não encontrado no servidor' });
    } else {
      res.end();
    }
  });

  dump.on('close', (code) => {
    if (code !== 0) {
      console.error(`pg_dump finalizou com código ${code}: ${stderr}`);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro ao gerar backup' });
      } else {
        res.end();
      }
    } else {
      console.log(`Backup gerado com sucesso: ${backupFileName}`);
    }
  });
}
