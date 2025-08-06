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
  Switch,
  useToast,
} from '@chakra-ui/react'
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import Head from 'next/head'

interface Category {
  id: number
  name: string
  description: string | null
  url: string | null
  favorite: boolean
  is_main: boolean
  is_active: boolean
  order: number
  created_at: string
  _count: {
    posts: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/pg/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar categorias',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Categorias - Globaliza Contabil</title>
      </Head>
      
      <AdminLayout>
        <Box maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
          <HStack justify="space-between" mb={6}>
            <Heading size="lg">
              Categorias
            </Heading>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={onOpen}>
              Nova Categoria
            </Button>
          </HStack>

          {loading ? (
            <Text>Carregando...</Text>
          ) : categories.length === 0 ? (
            <Box
              bg="white"
              p={8}
              rounded="lg"
              shadow="md"
              textAlign="center">
              <Text color="gray.500" mb={4}>
                Nenhuma categoria criada ainda.
              </Text>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={onOpen}>
                Criar Primeira Categoria
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
                    <Th>Nome</Th>
                    <Th>Descrição</Th>
                    <Th>URL</Th>
                    <Th>Posts</Th>
                    <Th>Status</Th>
                    <Th>Ordem</Th>
                    <Th>Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {categories.map((category) => (
                    <Tr key={category.id}>
                      <Td fontWeight="medium">
                        <HStack>
                          <Text>{category.name}</Text>
                          {category.favorite && (
                            <Badge colorScheme="yellow" size="sm">
                              Favorita
                            </Badge>
                          )}
                          {category.is_main && (
                            <Badge colorScheme="blue" size="sm">
                              Principal
                            </Badge>
                          )}
                        </HStack>
                      </Td>
                      <Td>
                        <Text noOfLines={2} maxW="200px">
                          {category.description || '-'}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.600">
                          {category.url || '-'}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="green">
                          {category._count.posts} posts
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={category.is_active ? 'green' : 'red'}>
                          {category.is_active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{category.order}</Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Editar categoria"
                            icon={<FiEdit />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                          />
                          <IconButton
                            aria-label="Excluir categoria"
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

        {/* Modal para criar/editar categoria */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Criar Nova Categoria</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nome</FormLabel>
                  <Input placeholder="Digite o nome da categoria" />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Descrição</FormLabel>
                  <Textarea placeholder="Digite uma descrição para a categoria" />
                </FormControl>
                
                <FormControl>
                  <FormLabel>URL</FormLabel>
                  <Input placeholder="categoria-url" />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="favorite" mb="0">
                    Categoria Favorita
                  </FormLabel>
                  <Switch id="favorite" />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="is_main" mb="0">
                    Categoria Principal
                  </FormLabel>
                  <Switch id="is_main" />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="is_active" mb="0">
                    Ativa
                  </FormLabel>
                  <Switch id="is_active" defaultChecked />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="blue">
                Salvar Categoria
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </AdminLayout>
    </>
  )
} 