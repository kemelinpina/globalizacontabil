import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

// Interface para opções de upload
interface UploadOptions {
  folder: string
  public_id: string
  resource_type?: "auto" | "image" | "video" | "raw"
  quality?: number
  fetch_format?: string | undefined
  transformation?: unknown[]
  format?: string
  type?: "upload" | "private" | "authenticated"
  flags?: string
}

// Função para fazer upload de buffer
export const uploadToCloudinary = async (
  buffer: Buffer,
  originalName: string,
  folder: string = 'globalizacontabil'
): Promise<{
  public_id: string
  secure_url: string
  width?: number
  height?: number
  format: string
  bytes: number
}> => {
  // Detectar tipo de arquivo baseado na extensão
  const fileExtension = originalName.split('.').pop()?.toLowerCase()
  
  // Configurações específicas para diferentes tipos de arquivo
  let uploadOptions: UploadOptions = {
    folder,
    public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`,
    type: 'upload',
  }

  // Para imagens, aplicar otimizações leves sem converter formato
  if (fileExtension && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
    uploadOptions = {
      ...uploadOptions,
      resource_type: 'image',
      quality: 90,
    }
  } else if (fileExtension && ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'].includes(fileExtension)) {
    // Para documentos, usar resource_type 'raw' para preservar completamente
    uploadOptions = {
      ...uploadOptions,
      resource_type: 'raw',
      format: fileExtension,       // mantém a extensão
      transformation: [],          // sem transformações
      // Forçar download direto (mais confiável)
      flags: 'attachment',
      // Garantir que não seja convertido
      fetch_format: undefined,
      quality: undefined,
    }
  } else if (fileExtension && ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(fileExtension)) {
    // Para vídeos
    uploadOptions = {
      ...uploadOptions,
      resource_type: 'video',
    }
  } else if (fileExtension && ['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(fileExtension)) {
    // Para áudios
    uploadOptions = {
      ...uploadOptions,
      resource_type: 'video', // Cloudinary usa 'video' para áudio também
    }
  } else {
    // Para outros tipos de arquivo, usar 'raw' como padrão
    uploadOptions = {
      ...uploadOptions,
      resource_type: 'raw',
      format: fileExtension,
      transformation: [],
      // Forçar download para arquivos desconhecidos
      flags: 'attachment',
    }
  }

  console.log('=== DEBUG UPLOAD ===')
  console.log('File extension:', fileExtension)
  console.log('Upload options:', uploadOptions)
  console.log('====================')

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error)
          reject(error)
        } else if (result) {
          console.log('✅ Upload result:', {
            public_id: result.public_id,
            format: result.format,
            resource_type: result.resource_type,
            secure_url: result.secure_url,
            originalName,
            fileExtension
          })
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          })
        } else {
          reject(new Error('Upload falhou'))
        }
      }
    ).end(buffer)
  })
}

// Função para deletar arquivo do Cloudinary
export const deleteFromCloudinary = async (publicId: string, resourceType: 'image'|'video'|'raw' = 'image'): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
  } catch (error) {
    console.error('Erro ao deletar arquivo do Cloudinary:', error)
    throw error
  }
}

// Função de teste para verificar configurações
export const testCloudinaryConfig = () => {
  console.log('Cloudinary config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'undefined',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'undefined',
  })
}

// URL helper (inline x download)
// DOWNLOAD (força download) - Padrão para PDFs
export const buildDownloadPdfUrl = (publicId: string, filename = 'arquivo.pdf') =>
  cloudinary.url(publicId, {
    resource_type: 'raw',
    type: 'upload',
    format: 'pdf',
    flags: 'attachment', // equivale a fl_attachment
  })

// INLINE (abre no navegador) - Opcional
export const buildInlinePdfUrl = (publicId: string) =>
  cloudinary.url(publicId, {
    resource_type: 'raw',
    type: 'upload',
    format: 'pdf',
    // nada de flags
  })

// URL helper genérico para qualquer arquivo
export const buildInlineUrl = (publicId: string, resourceType: 'image'|'video'|'raw' = 'image', format?: string) =>
  cloudinary.url(publicId, {
    resource_type: resourceType,
    type: 'upload',
    format,
  })

export const buildDownloadUrl = (publicId: string, resourceType: 'image'|'video'|'raw' = 'image', format?: string, filename?: string) =>
  cloudinary.url(publicId, {
    resource_type: resourceType,
    type: 'upload',
    format,
    flags: filename ? `attachment:${filename}` : 'attachment',
  })
