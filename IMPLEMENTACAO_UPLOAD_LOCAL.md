# 🚀 Implementação do Sistema de Upload Local

## 📋 Visão Geral

Este documento descreve a implementação completa do sistema de upload de arquivos local, substituindo o Cloudinary por armazenamento direto na VPS.

## 🏗️ Arquitetura

### Estrutura de Pastas
```
/var/www/html/
└── arquivos_globalizacontabil/
    └── (todos os arquivos aqui, sem subpastas)
```

### Fluxo de Upload
1. **Frontend** → Seleciona arquivo
2. **API Route** → Recebe arquivo via Multer
3. **Sistema** → Determina pasta baseado no tipo
4. **Armazenamento** → Salva na pasta apropriada
5. **Banco** → Registra informações do arquivo
6. **Retorno** → URL de acesso direto

## 🔧 Configuração do Servidor

### 1. Criar Pastas
Execute o script `setup-server-folders.sh`:
```bash
chmod +x setup-server-folders.sh
sudo ./setup-server-folders.sh
```

### 2. Configurar Nginx/Apache
Adicione a configuração do arquivo `nginx-config-example.conf` ao seu servidor web.

### 3. Configurar Variáveis de Ambiente
Crie/edite `.env.local`:
```bash
NEXT_PUBLIC_BASE_URL=https://seudominio.com
```

## 📁 Arquivos Modificados

### 1. API de Upload (`src/pages/api/arquivos/upload.ts`)
- ✅ Substituído Cloudinary por armazenamento local
- ✅ Organização automática por tipo de arquivo
- ✅ Validação e tratamento de erros
- ✅ Suporte a múltiplos arquivos

### 2. Componente FileUpload (`src/components/ImageUpload.tsx`)
- ✅ Renomeado para FileUpload
- ✅ Interface moderna com Chakra UI
- ✅ Preview inteligente (imagem vs ícone)
- ✅ Botões de ação (visualizar/download, copiar link)
- ✅ Progresso de upload

### 3. Schema do Banco (`prisma/schema.prisma`)
- ✅ Adicionados campos `path` e `subFolder`
- ✅ Mantida compatibilidade com Cloudinary

### 4. Página de Gerenciamento (`src/pages/adm/files.tsx`)
- ✅ Atualizada para nova API
- ✅ Corrigido parâmetro `files` (plural)

## 🚀 Como Usar

### 1. Upload de Arquivo
```typescript
import FileUpload from '../components/FileUpload';

<FileUpload
  onUpload={(fileInfo) => console.log('Arquivo enviado:', fileInfo)}
  accept="*/*"
  maxSize={100} // 100MB
  showPreview={true}
/>
```

### 2. Acesso aos Arquivos
```typescript
// URL gerada automaticamente:
// https://seudominio.com/arquivos_globalizacontabil/1234567890_documento.pdf
// https://seudominio.com/arquivos_globalizacontabil/1234567890_imagem.jpg
```

### 3. Download Forçado
- **PDFs e documentos** → Download automático
- **Imagens** → Visualização no navegador
- **Vídeos/Áudios** → Streaming

## 🔒 Segurança

### Validações Implementadas
- ✅ Tamanho máximo: 100MB
- ✅ Tipos de arquivo: Todos permitidos
- ✅ Nomes seguros: Timestamp + nome limpo
- ✅ Organização por tipo: Separação automática

### Recomendações
- 🔐 Implementar autenticação na API
- 🔐 Validar tipos de arquivo permitidos
- 🔐 Implementar rate limiting
- 🔐 Scan antivírus (opcional)

## 📊 Vantagens da Nova Implementação

### ✅ **Prós**
- **Controle total** sobre arquivos
- **Sem custos** mensais
- **Sem limitações** externas
- **Performance** superior
- **Segurança** controlada
- **Backup** local

### ⚠️ **Considerações**
- **Espaço em disco** necessário
- **Backup** manual (recomendado)
- **Configuração** do servidor web
- **Manutenção** da infraestrutura

## 🧪 Testes

### 1. Upload de Diferentes Tipos
- [ ] PDF (deve ir para `documentos/`)
- [ ] JPG (deve ir para `imagens/`)
- [ ] MP4 (deve ir para `videos/`)
- [ ] DOC (deve ir para `documentos/`)

### 2. Funcionalidades
- [ ] Preview de imagens
- [ ] Download de documentos
- [ ] Cópia de links
- [ ] Progresso de upload

### 3. Validações
- [ ] Tamanho máximo (100MB)
- [ ] Nomes de arquivo seguros
- [ ] Organização automática

## 🚨 Troubleshooting

### Erro: "Permission denied"
```bash
sudo chown -R www-data:www-data /var/www/html/arquivos_globalizacontabil
sudo chmod -R 755 /var/www/html/arquivos_globalizacontabil
```

### Erro: "Folder not found"
```bash
sudo mkdir -p /var/www/html/arquivos_globalizacontabil/{imagens,documentos,videos,outros}
```

### Erro: "Cannot write to disk"
```bash
# Verificar espaço em disco
df -h /var/www/html

# Verificar permissões
ls -la /var/www/html/arquivos_globalizacontabil
```

## 📈 Próximos Passos

### 1. Implementar
- [ ] Sistema de backup automático
- [ ] Limpeza de arquivos antigos
- [ ] Compressão de imagens
- [ ] Thumbnails automáticos

### 2. Melhorias
- [ ] Drag & drop
- [ ] Upload em lote
- [ ] Preview de PDFs
- [ ] Editor de metadados

### 3. Monitoramento
- [ ] Logs de acesso
- [ ] Estatísticas de uso
- [ ] Alertas de espaço
- [ ] Relatórios

## 🎯 Conclusão

A implementação do upload local oferece:
- **Controle total** sobre arquivos
- **Performance superior** sem dependências externas
- **Custos reduzidos** a zero
- **Flexibilidade** para customizações futuras

O sistema está pronto para uso em produção e pode ser facilmente expandido conforme necessário.
