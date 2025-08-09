import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

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
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`,
        resource_type: 'auto', // Detecta automaticamente o tipo (imagem, vídeo, etc)
        quality: 'auto', // Otimização automática
        fetch_format: 'auto', // Formato automático baseado no browser
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
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
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Erro ao deletar arquivo do Cloudinary:', error)
    throw error
  }
}
