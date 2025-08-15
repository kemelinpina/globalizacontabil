import React from 'react'
import {
  Box,
  AspectRatio,
  Link,
  Text,
  VStack,
  Icon,
  useToast,
} from '@chakra-ui/react'
import { FiDownload, FiEye, FiFileText } from 'react-icons/fi'

interface PdfViewerProps {
  src: string
  title?: string
  showDownloadLink?: boolean
  height?: string
}

export function PdfViewer({ 
  src, 
  title = "Documento PDF", 
  showDownloadLink = true,
  height = "80vh"
}: PdfViewerProps) {
  const toast = useToast()

  const handleDownload = () => {
    // Criar um link temporário para download
    const link = document.createElement('a')
    link.href = src
    link.download = title || 'documento.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Download iniciado",
      description: "O arquivo está sendo baixado",
      status: "success",
      duration: 2000,
      isClosable: true,
    })
  }

  return (
    <Box w="100%" borderWidth="1px" rounded="lg" overflow="hidden" bg="white">
      <AspectRatio ratio={16/9} maxH={height}>
        {/* iframe simples abre o PDF inline */}
        <iframe 
          src={src} 
          title={title}
          style={{ 
            width: '100%', 
            height: '100%', 
            border: '0',
            backgroundColor: '#f8f9fa'
          }} 
        />
      </AspectRatio>

      {/* Barra de ações */}
      {showDownloadLink && (
        <Box p={3} bg="gray.50" borderTop="1px solid" borderColor="gray.200">
          <VStack spacing={2}>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              <Icon as={FiFileText} mr={2} />
              {title}
            </Text>
            
            <Box display="flex" gap={2}>
              <Link
                href={src}
                isExternal
                display="flex"
                alignItems="center"
                gap={2}
                px={3}
                py={1}
                bg="blue.500"
                color="white"
                borderRadius="md"
                fontSize="sm"
                _hover={{ bg: "blue.600" }}
                textDecoration="none"
              >
                <Icon as={FiEye} />
                Abrir em nova aba
              </Link>
              
              <Link
                onClick={handleDownload}
                display="flex"
                alignItems="center"
                gap={2}
                px={3}
                py={1}
                bg="green.500"
                color="white"
                borderRadius="md"
                fontSize="sm"
                _hover={{ bg: "green.600" }}
                textDecoration="none"
                cursor="pointer"
              >
                <Icon as={FiDownload} />
                Download
              </Link>
            </Box>

            <Text fontSize="xs" color="gray.500" textAlign="center">
              Se o PDF não abrir acima, use os botões acima para visualizar ou baixar
            </Text>
          </VStack>
        </Box>
      )}
    </Box>
  )
}

export default PdfViewer
