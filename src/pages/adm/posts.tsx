import {
  Box,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
} from '@chakra-ui/react'
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import Head from 'next/head'

interface Post {
  id: number
  title: string
  slug: string
  status: string
  author: {
    name: string
  }
  category: {
    name: string
  }
  created_at: string
  view_count: number
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/pg/posts')
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar posts',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'green'
      case 'draft':
        return 'yellow'
      case 'archived':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado'
      case 'draft':
        return 'Rascunho'
      case 'archived':
        return 'Arquivado'
      default:
        return status
    }
  }

  return (
    <>
      <Head>
        <title>Posts - Globaliza Contabil</title>
      </Head>
      
      <AdminLayout>
        <Box maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
          <HStack justify="space-between" mb={6}>
            <Heading size="lg">
              Posts
            </Heading>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={onOpen}>
              Novo Post
            </Button>
          </HStack>

          {loading ? (
            <Text>Carregando...</Text>
          ) : posts.length === 0 ? (
            <Box
              bg="white"
              p={8}
              rounded="lg"
              shadow="md"
              textAlign="center">
              <Text color="gray.500" mb={4}>
                Nenhum post criado ainda.
              </Text>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={onOpen}>
                Criar Primeiro Post
              </Button>
            </Box>
          ) : (
            <Box
              bg="white"
              rounded="lg"
              shadow="md"
              overflow="hidden">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Título</Th>
                    <Th>Categoria</Th>
                    <Th>Autor</Th>
                    <Th>Status</Th>
                    <Th>Visualizações</Th>
                    <Th>Criado em</Th>
                    <Th>Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {posts.map((post) => (
                    <Tr key={post.id}>
                      <Td fontWeight="medium">{post.title}</Td>
                      <Td>{post.category.name}</Td>
                      <Td>{post.author.name}</Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(post.status)}>
                          {getStatusText(post.status)}
                        </Badge>
                      </Td>
                      <Td>{post.view_count}</Td>
                      <Td>
                        {new Date(post.created_at).toLocaleDateString('pt-BR')}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Ver post"
                            icon={<FiEye />}
                            size="sm"
                            variant="ghost"
                          />
                          <IconButton
                            aria-label="Editar post"
                            icon={<FiEdit />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                          />
                          <IconButton
                            aria-label="Excluir post"
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>

        {/* Modal para criar/editar post */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Criar Novo Post</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Título</FormLabel>
                  <Input placeholder="Digite o título do post" />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Slug</FormLabel>
                  <Input placeholder="titulo-do-post" />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Categoria</FormLabel>
                  <Select placeholder="Selecione uma categoria">
                    <option value="1">Contabilidade</option>
                    <option value="2">Impostos</option>
                    <option value="3">Legislação</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Resumo</FormLabel>
                  <Textarea placeholder="Digite um resumo do post" />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Conteúdo</FormLabel>
                  <Textarea 
                    placeholder="Digite o conteúdo do post" 
                    rows={10}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select defaultValue="draft">
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Arquivado</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="blue">
                Salvar Post
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </AdminLayout>
    </>
  )
} 