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
  useToast,
} from '@chakra-ui/react'
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
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
  const router = useRouter()
  const toast = useToast()

  const fetchPosts = useCallback(async () => {
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
  }, [toast])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

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
              onClick={() => router.push('/adm/posts/create')}>
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
                onClick={() => router.push('/adm/posts/create')}>
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
      </AdminLayout>
    </>
  )
} 