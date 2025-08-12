# Rotas de Backup do Banco de Dados

Este diretório contém as rotas para backup do banco de dados SQLite do projeto Globaliza Contabil.

## Rotas Disponíveis

### 1. `/api/backup-db` (Produção)
- **Método**: GET
- **Descrição**: Rota específica para produção que busca o banco no caminho `/var/www/html/globalizacontabil/storage/dev.db`
- **Uso**: Ideal para servidor de produção

### 2. `/api/backup-db-dev` (Desenvolvimento + Produção)
- **Método**: GET
- **Descrição**: Rota inteligente que tenta primeiro o caminho de produção e depois o de desenvolvimento
- **Uso**: Funciona tanto em desenvolvimento quanto em produção

## Como Usar

### Via Navegador
Acesse diretamente no navegador:
```
http://localhost:3000/api/backup-db-dev
```

### Via cURL
```bash
curl -O -J "http://localhost:3000/api/backup-db-dev"
```

### Via JavaScript/Fetch
```javascript
fetch('/api/backup-db-dev')
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup_banco.db';
    a.click();
  });
```

## Funcionamento

1. **Verificação**: A rota verifica se o banco de dados existe
2. **Cópia**: Cria uma cópia temporária do arquivo `.db`
3. **Download**: Envia o arquivo como resposta para download
4. **Limpeza**: Remove o arquivo temporário após o envio

## Estrutura de Arquivos

```
public/
  backups/          # Diretório criado automaticamente para arquivos temporários
    backup_dev_db_[timestamp].db
```

## Logs

A rota registra logs no console do servidor:
- Sucesso: "Backup criado e enviado com sucesso: [nome_arquivo]"
- Erro: "Erro ao criar backup: [detalhes]"

## Segurança

- Apenas método GET é permitido
- Arquivos temporários são removidos automaticamente
- Não expõe informações sensíveis do banco

## Notas Importantes

- Em produção, certifique-se de que o usuário `devops` tem permissão de leitura no arquivo do banco
- O arquivo de backup inclui timestamp para evitar conflitos de nome
- A rota funciona com bancos SQLite (não PostgreSQL como no projeto Contemp)
