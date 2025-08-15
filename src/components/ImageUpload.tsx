import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Image,
  IconButton,
  useToast,
  Progress,
  Spinner,
  Badge,
  Flex,
  Icon
} from '@chakra-ui/react';
import { FiUpload, FiX, FiEye, FiFile, FiDownload } from 'react-icons/fi';

interface FileUploadProps {
  onUpload?: (fileInfo: UploadedFile) => void;
  onUploadSuccess?: (url: string) => void; // Para compatibilidade com código existente
  onUploadError?: (error: string) => void; // Para compatibilidade com código existente
  accept?: string;
  maxSize?: number; // em MB
  multiple?: boolean;
  showPreview?: boolean;
}

interface UploadedFile {
  id: number;
  originalName: string;
  fileName: string;
  url: string;
  size: number;
  type: string;
  // Removidos campos path e subFolder que não existem no banco
}

interface FileInfo {
  name: string;
  type: string;
  size: number;
}

export default function FileUpload({
  onUpload,
  onUploadSuccess,
  onUploadError,
  accept = "*/*",
  maxSize = 100, // 100MB padrão
  multiple = false,
  showPreview = true
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validação de tamanho
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo ${maxSize}MB`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setFileInfo({
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Preview para imagens
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Para outros tipos de arquivo, mostrar ícone
      setPreview(null);
    }

    // Upload automático
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('files', file);

      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/arquivos/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Erro no upload: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setUploadedFile(result.files[0]);
        
        toast({
          title: "Upload realizado com sucesso!",
          description: `Arquivo "${file.name}" enviado`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Chama as callbacks para compatibilidade
        if (onUpload) {
          onUpload(result.files[0]);
        }
        
        // Para compatibilidade com código existente
        if (onUploadSuccess) {
          onUploadSuccess(result.files[0].url);
        }
      } else {
        const errorMessage = result.error || 'Erro desconhecido no upload';
        
        // Para compatibilidade com código existente
        if (onUploadError) {
          onUploadError(errorMessage);
        }
        
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('Erro no upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // Para compatibilidade com código existente
      if (onUploadError) {
        onUploadError(errorMessage);
      }
      
      toast({
        title: "Erro no upload",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCopyLink = async () => {
    if (!uploadedFile?.url) return;
    
    try {
      await navigator.clipboard.writeText(uploadedFile.url);
      toast({
        title: "Link copiado!",
        description: "Link do arquivo copiado para a área de transferência",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = uploadedFile.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Link copiado!",
        description: "Link copiado para a área de transferência",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleDownload = () => {
    if (!uploadedFile?.url) return;
    
    // Para PDFs e documentos, forçar download
    if (fileInfo?.type.includes('pdf') || fileInfo?.type.includes('document')) {
      const link = document.createElement('a');
      link.href = uploadedFile.url;
      link.download = fileInfo.name;
      link.click();
    } else {
      // Para outros arquivos, abrir em nova aba
      window.open(uploadedFile.url, '_blank');
    }
  };

  const handleClear = () => {
    setPreview(null);
    setFileInfo(null);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('document')) return '📝';
    if (fileType.includes('video')) return '🎥';
    if (fileType.includes('audio')) return '🎵';
    return '📁';
  };

  const getFileTypeLabel = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'Imagem';
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('document')) return 'Documento';
    if (fileType.includes('video')) return 'Vídeo';
    if (fileType.includes('audio')) return 'Áudio';
    return 'Arquivo';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* Área de Upload */}
        <Box
          border="2px dashed"
          borderColor="gray.300"
          borderRadius="lg"
          p={6}
          textAlign="center"
          _hover={{ borderColor: "blue.400" }}
          transition="all 0.2s"
        >
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            display="none"
            multiple={multiple}
          />
          
          <Button
            leftIcon={<FiUpload />}
            colorScheme="blue"
            onClick={() => fileInputRef.current?.click()}
            isLoading={isUploading}
            loadingText="Enviando..."
            size="lg"
          >
            Selecionar Arquivo
          </Button>
          
          <Text mt={2} fontSize="sm" color="gray.600">
            Arraste e solte ou clique para selecionar
          </Text>
          
          <Text fontSize="xs" color="gray.500">
            Máximo: {maxSize}MB | Aceita: {accept === "*/*" ? "Todos os tipos" : accept}
          </Text>
        </Box>

        {/* Progresso do Upload */}
        {isUploading && (
          <Box>
            <Text mb={2} fontSize="sm">Enviando arquivo...</Text>
            <Progress value={uploadProgress} colorScheme="blue" size="sm" />
            <Text mt={1} fontSize="xs" textAlign="right">{uploadProgress}%</Text>
          </Box>
        )}

        {/* Preview e Informações do Arquivo */}
        {showPreview && (fileInfo || uploadedFile) && (
          <Box
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
            p={4}
            bg="gray.50"
          >
            <HStack justify="space-between" mb={3}>
              <HStack>
                <Text fontSize="lg">{getFileIcon(fileInfo?.type || '')}</Text>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" fontSize="sm">
                    {fileInfo?.name || uploadedFile?.originalName}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {getFileTypeLabel(fileInfo?.type || '')} • {formatFileSize(fileInfo?.size || 0)}
                  </Text>
                </VStack>
              </HStack>
              
              <IconButton
                aria-label="Limpar"
                icon={<FiX />}
                size="sm"
                variant="ghost"
                onClick={handleClear}
              />
            </HStack>

            {/* Preview da Imagem */}
            {preview && fileInfo?.type.startsWith('image/') && (
              <Box mb={3}>
                <Image
                  src={preview}
                  alt="Preview"
                  maxH="200px"
                  objectFit="contain"
                  borderRadius="md"
                />
              </Box>
            )}

            {/* Botões de Ação */}
            {uploadedFile && (
              <HStack spacing={2}>
                <IconButton
                  aria-label="Visualizar/Download"
                  icon={fileInfo?.type.includes('pdf') || fileInfo?.type.includes('document') ? <FiDownload /> : <FiEye />}
                  size="sm"
                  colorScheme="blue"
                  onClick={handleDownload}
                />
                
                <IconButton
                  aria-label="Copiar link"
                  icon={<FiFile />}
                  size="sm"
                  colorScheme="green"
                  onClick={handleCopyLink}
                />
                
                <Badge colorScheme="green" variant="subtle">
                  Enviado
                </Badge>
              </HStack>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
}
