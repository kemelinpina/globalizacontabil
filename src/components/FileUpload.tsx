import React, { useState } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  IconButton,
  useToast,
  Spinner,
  Badge,
} from '@chakra-ui/react'
import { FiUpload, FiX, FiEye, FiFile, FiImage, FiFileText, FiVideo, FiMusic } from 'react-icons/fi'
import { buildInlineUrl, buildDownloadUrl, buildDownloadPdfUrl } from '../lib/cloudinary'

interface FileUploadProps {
  value?: string
  onChange?: (url: string) => void
  onRemove?: () => void
  placeholder?: string
  accept?: string
  maxSize?: number // em MB
  onUploadSuccess?: (url: string) => void
  onUploadError?: (error: string) => void
  showPreview?: boolean
}

export default function FileUpload({
  value,
  onChange,
  onRemove,
  placeholder = "Clique para fazer upload do arquivo",
  accept = "*/*",
  maxSize = 10,
  onUploadSuccess,
  onUploadError,
  showPreview = true
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [fileInfo, setFileInfo] = useState<{ name: string; type: string; size: number } | null>(null)
  const toast = useToast()

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FiImage size={24} />
    if (type.startsWith('video/')) return <FiVideo size={24} />
    if (type.startsWith('audio/')) return <FiMusic size={24} />
    if (type.includes('pdf') || type.includes('document')) return <FiFileText size={24} />
    return <FiFile size={24} />
  }

  const getFileTypeLabel = (type: string) => {
    if (type.startsWith('image/')) return 'Imagem'
    if (type.startsWith('video/')) return 'Vídeo'
    if (type.startsWith('audio/')) return 'Áudio'
    if (type.includes('pdf')) return 'PDF'
    if (type.includes('document') || type.includes('word')) return 'Documento'
    if (type.includes('spreadsheet') || type.includes('excel')) return 'Planilha'
    return 'Arquivo'
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      const errorMsg = `O arquivo deve ter no máximo ${maxSize}MB`
      onUploadError?.(errorMsg)
      toast({
        title: "Arquivo muito grande",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/arquivos/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro no upload')
      }

      setPreview(data.file.url)
      setFileInfo({
        name: data.file.name,
        type: data.file.type,
        size: data.file.size
      })
      onChange?.(data.file.url)
      onUploadSuccess?.(data.file.url)

      toast({
        title: "Upload realizado com sucesso",
        description: "Arquivo enviado com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      })

    } catch (error) {
      console.error('Erro no upload:', error)
      const errorMsg = error instanceof Error ? error.message : "Erro interno do servidor"
      onUploadError?.(errorMsg)
      toast({
        title: "Erro no upload",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setFileInfo(null)
    onRemove?.()
  }

  const handleCopyLink = async () => {
    if (!preview || !fileInfo) return
    
    try {
      let urlToCopy = preview
      
      // Para PDFs e documentos, gerar URL de download
      if (fileInfo.type.includes('pdf') || fileInfo.type.includes('document')) {
        const publicId = preview.split('/').pop() || ''
        urlToCopy = buildDownloadPdfUrl(publicId, fileInfo.name)
      }
      
      await navigator.clipboard.writeText(urlToCopy)
      toast({
        title: "Link copiado!",
        description: fileInfo.type.includes('pdf') 
          ? "Link de download do PDF copiado para a área de transferência"
          : "Link do arquivo copiado para a área de transferência",
        status: "success",
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      // Fallback para navegadores mais antigos
      try {
        const textArea = document.createElement('textarea')
        textArea.value = preview
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        toast({
          title: "Link copiado!",
          description: "Link do arquivo copiado para a área de transferência",
          status: "success",
          duration: 2000,
          isClosable: true,
        })
      } catch {
        toast({
          title: "Erro ao copiar link",
          description: "Tente novamente ou copie manualmente",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      {preview && fileInfo ? (
        <Box position="relative" borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
          {showPreview && fileInfo.type.startsWith('image/') ? (
            <img
              src={preview}
              alt="Preview"
              style={{
                width: '200px',
                height: '200px',
                objectFit: 'contain',
              }}
            />
          ) : (
            <Box
              p={6}
              textAlign="center"
              bg="gray.50"
              minH="200px"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              {getFileIcon(fileInfo.type)}
              <Text mt={2} fontSize="sm" fontWeight="medium">
                {fileInfo.name}
              </Text>
              <Badge colorScheme="blue" mt={1}>
                {getFileTypeLabel(fileInfo.type)}
              </Badge>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {formatFileSize(fileInfo.size)}
              </Text>
            </Box>
          )}
          
          <HStack position="absolute" top={2} right={2} spacing={2}>
            <IconButton
              aria-label="Visualizar"
              icon={<FiEye />}
              size="sm"
              colorScheme="blue"
              onClick={() => {
                // Para PDFs, abrir URL de download
                if (fileInfo.type.includes('pdf') || fileInfo.type.includes('document')) {
                  const publicId = preview.split('/').pop() || ''
                  const downloadUrl = buildDownloadPdfUrl(publicId, fileInfo.name)
                  window.open(downloadUrl, '_blank')
                } else {
                  window.open(preview, '_blank')
                }
              }}
            />
            <IconButton
              aria-label="Copiar link"
              icon={<FiFile />}
              size="sm"
              colorScheme="green"
              onClick={handleCopyLink}
            />
            <IconButton
              aria-label="Remover"
              icon={<FiX />}
              size="sm"
              colorScheme="red"
              onClick={handleRemove}
            />
          </HStack>
        </Box>
      ) : (
        <Box
          border="2px dashed"
          borderColor="gray.300"
          borderRadius="md"
          p={6}
          textAlign="center"
          cursor="pointer"
          _hover={{ borderColor: "blue.400" }}
          transition="all 0.2s"
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="file-upload"
            disabled={isUploading}
          />
          <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
            <VStack spacing={3}>
              {isUploading ? (
                <Spinner size="lg" color="blue.500" />
              ) : (
                <FiUpload size={32} color="#3182CE" />
              )}
              <Text fontSize="sm" color="gray.600">
                {isUploading ? "Enviando..." : placeholder}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Máximo: {maxSize}MB
              </Text>
              {accept !== "*/*" && (
                <Text fontSize="xs" color="gray.400">
                  Tipos aceitos: {accept}
                </Text>
              )}
            </VStack>
          </label>
        </Box>
      )}
    </VStack>
  )
}
