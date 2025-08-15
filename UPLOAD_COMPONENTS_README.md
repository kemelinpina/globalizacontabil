# Componentes de Upload - Globaliza Contabil

## Problemas Resolvidos

✅ **Upload de qualquer tipo de arquivo** - Agora aceita PDFs, documentos, vídeos, etc.
✅ **Link correto** - O botão de copiar link agora funciona corretamente
✅ **Preview inteligente** - Mostra preview para imagens e informações para outros arquivos
✅ **Compatibilidade** - Mantém compatibilidade com código existente

## Componentes Disponíveis

### 1. FileUpload (Novo - Recomendado)

Componente completo que aceita qualquer tipo de arquivo com preview inteligente.

```tsx
import FileUpload from '../../components/FileUpload'

// Uso básico
<FileUpload
  onUploadSuccess={(url) => console.log('Arquivo enviado:', url)}
  placeholder="Clique para fazer upload do arquivo"
  maxSize={10} // 10MB
/>

// Para aceitar apenas imagens
<FileUpload
  accept="image/*"
  showPreview={true}
  onUploadSuccess={handleImageUpload}
/>

// Para aceitar apenas PDFs
<FileUpload
  accept=".pdf"
  placeholder="Clique para fazer upload do PDF"
  onUploadSuccess={handlePdfUpload}
/>
```

**Props disponíveis:**
- `value`: URL do arquivo atual
- `onChange`: Callback quando o arquivo muda
- `onRemove`: Callback quando o arquivo é removido
- `placeholder`: Texto do placeholder
- `accept`: Tipos de arquivo aceitos (padrão: "*/*")
- `maxSize`: Tamanho máximo em MB (padrão: 10)
- `onUploadSuccess`: Callback de sucesso
- `onUploadError`: Callback de erro
- `showPreview`: Se deve mostrar preview (padrão: true)

### 2. ImageUpload (Atualizado - Compatibilidade)

Componente existente atualizado para aceitar todos os tipos de arquivo quando necessário.

```tsx
import ImageUpload from '../../components/ImageUpload'

// Uso tradicional (apenas imagens)
<ImageUpload
  onUploadSuccess={handleImageUpload}
  placeholder="Clique para fazer upload da imagem"
/>

// Uso atualizado (todos os arquivos)
<ImageUpload
  allowAllFiles={true}
  accept="*/*"
  maxSize={10}
  onUploadSuccess={handleFileUpload}
  placeholder="Clique para fazer upload do arquivo"
/>
```

**Nova prop:**
- `allowAllFiles`: Se true, aceita qualquer tipo de arquivo (padrão: false)

## Como Migrar

### Opção 1: Substituir por FileUpload (Recomendado)

```tsx
// Antes
import ImageUpload from '../../components/ImageUpload'

<ImageUpload
  onUploadSuccess={handleUpload}
  placeholder="Upload de imagem"
/>

// Depois
import FileUpload from '../../components/FileUpload'

<FileUpload
  onUploadSuccess={handleUpload}
  placeholder="Upload de arquivo"
  maxSize={10}
/>
```

### Opção 2: Atualizar ImageUpload existente

```tsx
// Adicionar allowAllFiles={true}
<ImageUpload
  allowAllFiles={true}
  accept="*/*"
  maxSize={10}
  onUploadSuccess={handleUpload}
  placeholder="Upload de arquivo"
/>
```

## Funcionalidades do FileUpload

### Preview Inteligente
- **Imagens**: Mostra preview visual
- **Outros arquivos**: Mostra ícone, nome, tipo e tamanho

### Botões de Ação
- 👁️ **Visualizar**: Abre arquivo em nova aba
- 📋 **Copiar link**: Copia URL para área de transferência
- ❌ **Remover**: Remove arquivo selecionado

### Validações
- Tamanho máximo configurável
- Tipos de arquivo configuráveis
- Feedback visual durante upload

### Suporte a Diferentes Tipos
- Imagens (JPG, PNG, GIF, etc.)
- Documentos (PDF, DOC, DOCX, etc.)
- Planilhas (XLS, XLSX, etc.)
- Vídeos (MP4, AVI, etc.)
- Áudios (MP3, WAV, etc.)
- Arquivos genéricos

## Exemplo de Uso Completo

```tsx
import React, { useState } from 'react'
import FileUpload from '../../components/FileUpload'

export default function MinhaPagina() {
  const [arquivoUrl, setArquivoUrl] = useState('')

  const handleUploadSuccess = (url: string) => {
    setArquivoUrl(url)
    console.log('Arquivo enviado com sucesso:', url)
  }

  const handleUploadError = (error: string) => {
    console.error('Erro no upload:', error)
  }

  return (
    <div>
      <h1>Upload de Arquivos</h1>
      
      <FileUpload
        value={arquivoUrl}
        onChange={setArquivoUrl}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        placeholder="Clique para fazer upload do arquivo"
        maxSize={15} // 15MB
        accept="*/*" // Todos os tipos
      />
      
      {arquivoUrl && (
        <p>Arquivo atual: {arquivoUrl}</p>
      )}
    </div>
  )
}
```

## Notas Importantes

1. **Cloudinary**: Os arquivos são enviados para o Cloudinary e retornam URLs completas
2. **Banco de dados**: As informações são salvas na tabela `files` do Prisma
3. **Tamanho máximo**: Padrão de 10MB, configurável via prop
4. **Tipos aceitos**: Por padrão aceita todos os tipos (`*/*`)
5. **Preview**: Automático para imagens, informativo para outros arquivos

## Solução de Problemas

### Arquivo não aparece na lista
- Verifique se o upload foi bem-sucedido
- Confirme se o arquivo foi salvo no banco
- Verifique os logs do servidor

### Link incorreto
- O componente agora copia a URL completa do Cloudinary
- Não é necessário concatenar com `window.location.origin`

### Upload falha
- Verifique o tamanho do arquivo
- Confirme se o tipo é aceito
- Verifique as configurações do Cloudinary
