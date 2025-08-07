import React, { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  HStack,
  useToast,
  Card,
  CardBody,
} from '@chakra-ui/react'
import { FiSave, FiArrowLeft } from 'react-icons/fi'
import { useRouter } from 'next/router'
import AdminLayout from '../../../components/AdminLayout'
import PostEditor from '../../../components/PostEditor'
import { useAuth } from '../../../contexts/AuthContext'
import Head from 'next/head'

interface Category {
  id: number
  name: string
  is_active: boolean
}

export default function CreatePost() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category_id: '',
    status: 'draft'
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const router = useRouter()
  const toast = useToast()
  const { user } = useAuth()

  // Buscar categorias
  useEffect(() => {
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
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [toast])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.slug || !formData.category_id) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/pg/create-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          author_id: user.id, // ID do usuário logado
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar post')
      }

      toast({
        title: 'Sucesso!',
        description: 'Post criado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      router.push('/adm/posts')

    } catch (error) {
      console.error('Erro ao criar post:', error)
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar post',
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
        <title>Criar Post - Globaliza Contabil</title>
      </Head>

      <AdminLayout>
        <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
          <HStack justify="space-between" mb={6}>
            <Heading size="lg">
              Criar Novo Post
            </Heading>
            <Button
              leftIcon={<FiArrowLeft />}
              variant="ghost"
              onClick={() => router.push('/adm/posts')}
            >
              Voltar
            </Button>
          </HStack>

          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <HStack spacing={4}>
                  <FormControl isRequired flex={1}>
                    <FormLabel>Título</FormLabel>
                    <Input 
                      placeholder="Digite o título do post"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </FormControl>
                  
                  <FormControl isRequired flex={1}>
                    <FormLabel>Slug</FormLabel>
                    <Input 
                      placeholder="titulo-do-post"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={4}>
                  <FormControl isRequired flex={1}>
                    <FormLabel>Categoria</FormLabel>
                    <Select 
                      placeholder="Selecione uma categoria"
                      value={formData.category_id}
                      onChange={(e) => handleInputChange('category_id', e.target.value)}
                    >
                      {loadingCategories ? (
                        <option value="">Carregando...</option>
                      ) : (
                        categories
                          .filter(cat => cat.is_active)
                          .map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))
                      )}
                    </Select>
                  </FormControl>
                  
                  <FormControl flex={1}>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <option value="draft">Rascunho</option>
                      <option value="published">Publicado</option>
                      <option value="archived">Arquivado</option>
                    </Select>
                  </FormControl>
                </HStack>
                
                <FormControl>
                  <FormLabel>Resumo</FormLabel>
                  <Textarea 
                    placeholder="Digite um resumo do post"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    rows={3}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Conteúdo</FormLabel>
                  <PostEditor
                    value={formData.content}
                    onChange={(data) => handleInputChange('content', data)}
                  />
                </FormControl>

                <HStack justify="flex-end" pt={4}>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/adm/posts')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="blue"
                    leftIcon={<FiSave />}
                    onClick={handleSubmit}
                    isLoading={loading}
                  >
                    Salvar Post
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </AdminLayout>
    </>
  )
} 