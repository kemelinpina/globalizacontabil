import React, { useState } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  IconButton,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { FiUpload, FiX, FiEye } from 'react-icons/fi'



interface ImageUploadProps {
  value?: string
  onChange?: (url: string) => void
  onRemove?: () => void
  placeholder?: string
  accept?: string
  maxSize?: number // em MB
  onUploadSuccess?: (url: string) => void
  onUploadError?: (error: string) => void
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  placeholder = "Clique para fazer upload da imagem",
  accept = "image/*",
  maxSize = 5,
  onUploadSuccess,
  onUploadError
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const toast = useToast()

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

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      const errorMsg = "Apenas arquivos de imagem são permitidos"
      onUploadError?.(errorMsg)
      toast({
        title: "Tipo de arquivo inválido",
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
      onChange?.(data.file.url)
      onUploadSuccess?.(data.file.url)

      toast({
        title: "Upload realizado com sucesso",
        description: "Imagem enviada com sucesso",
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
    onRemove?.()
  }

  return (
    <VStack spacing={4} align="stretch">
      {preview ? (
        <Box position="relative" borderRadius="md" overflow="hidden">
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
            }}
          />
          <HStack position="absolute" top={2} right={2} spacing={2}>
            <IconButton
              aria-label="Visualizar"
              icon={<FiEye />}
              size="sm"
              colorScheme="blue"
              onClick={() => window.open(preview, '_blank')}
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
            id="image-upload"
            disabled={isUploading}
          />
          <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
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
            </VStack>
          </label>
        </Box>
      )}
    </VStack>
  )
}
