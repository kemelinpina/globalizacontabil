import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  message,
  Space,
  Typography,
  Divider,
  Switch,
  DatePicker,
  Upload,
  Image,
} from 'antd'
import {
  SaveOutlined,
  UploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import AdminLayout from '../../components/AdminLayout'
import Head from 'next/head'
import dynamic from 'next/dynamic'

// Importar CKEditor dinamicamente para evitar problemas de SSR
const PostEditor = dynamic(() => import('../../components/PostEditor'), {
  ssr: false,
  loading: () => <div>Carregando editor...</div>
})

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

interface Category {
  id: number
  name: string
  color: string
}

interface FormValues {
  title: string
  slug: string
  category_id: number
  status: string
  excerpt?: string
  meta_title?: string
  meta_description?: string
  key_word_seo?: string
  featured_image?: string
  social_image?: string
  is_featured?: boolean
  is_pinned?: boolean
  reading_time?: number
  tags?: string
  published_at?: string
}

export default function CreatePostPage() {
  const [form] = Form.useForm()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [featuredImageUploading, setFeaturedImageUploading] = useState(false)
  const [socialImageUploading, setSocialImageUploading] = useState(false)
  const [content, setContent] = useState('')
  const router = useRouter()
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
        message.error('Erro ao carregar categorias')
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (values: FormValues) => {
    if (!content.trim()) {
      message.error('O conteúdo é obrigatório')
      return
    }

    if (!user) {
      message.error('Usuário não autenticado')
      return
    }

    // Validar campos obrigatórios
    if (!values.title || !values.slug || !values.category_id) {
      message.error('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)

    try {
      // Preparar dados para envio
      const postData = {
        title: values.title,
        content: content,
        slug: values.slug,
        category_id: values.category_id,
        author_id: user.id,
        excerpt: values.excerpt || '',
        status: values.status || 'draft',
        meta_title: values.meta_title || '',
        meta_description: values.meta_description || '',
        key_word_seo: values.key_word_seo || '',
        featured_image: values.featured_image || '',
        social_image: values.social_image || '',
        is_featured: values.is_featured || false,
        is_pinned: values.is_pinned || false,
        reading_time: values.reading_time || null,
        tags: values.tags || '',
        published_at: values.published_at ? new Date(values.published_at).toISOString() : null
      }

      const response = await fetch('/api/pg/create-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar post')
      }

      message.success('Post criado com sucesso!')
      router.push('/adm/posts')

    } catch (error) {
      console.error('Erro ao criar post:', error)
      message.error(error instanceof Error ? error.message : 'Erro ao criar post')
    } finally {
      setLoading(false)
    }
  }

  const handleFeaturedImageUpload = async (file: File) => {
    setFeaturedImageUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('files', file)

      const response = await fetch('/api/arquivos/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Erro no upload: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        const imageUrl = result.files[0].url
        form.setFieldsValue({ featured_image: imageUrl })
        message.success('Imagem destacada carregada com sucesso')
      } else {
        throw new Error(result.error || 'Erro desconhecido no upload')
      }

    } catch (error) {
      console.error('Erro no upload da imagem destacada:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      message.error(`Erro no upload: ${errorMessage}`)
    } finally {
      setFeaturedImageUploading(false)
    }
  }

  const handleSocialImageUpload = async (file: File) => {
    setSocialImageUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('files', file)

      const response = await fetch('/api/arquivos/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Erro no upload: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        const imageUrl = result.files[0].url
        form.setFieldsValue({ social_image: imageUrl })
        message.success('Imagem para redes sociais carregada com sucesso')
      } else {
        throw new Error(result.error || 'Erro desconhecido no upload')
      }

    } catch (error) {
      console.error('Erro no upload da imagem social:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      message.error(`Erro no upload: ${errorMessage}`)
    } finally {
      setSocialImageUploading(false)
    }
  }

  const featuredImageUploadProps = {
    name: 'featured_image',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file: File) => {
      // Validação de tipo
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('Você só pode fazer upload de arquivos de imagem!')
        return false
      }
      
      // Validação de tamanho (10MB para imagens)
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error('Imagem deve ter menos de 10MB!')
        return false
      }
      
      // Upload customizado
      handleFeaturedImageUpload(file)
      return false // Previne upload automático
    },
  }

  const socialImageUploadProps = {
    name: 'social_image',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file: File) => {
      // Validação de tipo
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('Você só pode fazer upload de arquivos de imagem!')
        return false
      }
      
      // Validação de tamanho (10MB para imagens)
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error('Imagem deve ter menos de 10MB!')
        return false
      }
      
      // Upload customizado
      handleSocialImageUpload(file)
      return false // Previne upload automático
    },
  }

  const currentFeaturedImage = form.getFieldValue('featured_image')
  const currentSocialImage = form.getFieldValue('social_image')

  return (
    <>
      <Head>
        <title>Criar Post - Globaliza Contabil</title>
      </Head>

      <AdminLayout>
        <div style={{ 
          display: 'flex', 
          height: 'calc(100vh - 140px)',
          gap: '24px',
          padding: '24px'
        }}>
          {/* Editor - 75% da largura */}
          <div style={{ flex: '0 0 75%' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                margin: 0 
              }}>
                Criar Novo Post
              </h1>
              <Space>
                <Button 
                  icon={<EyeOutlined />}
                  onClick={() => message.info('Preview em desenvolvimento')}
                >
                  Preview
                </Button>
                <Button 
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={loading}
                  onClick={() => form.submit()}
                >
                  Publicar
                </Button>
              </Space>
            </div>

            {/* Editor de Conteúdo */}
            <div style={{ 
              border: '1px solid #d9d9d9', 
              borderRadius: '6px',
              minHeight: 'calc(100vh - 300px)'
            }}>
              <PostEditor
                value={content}
                onChange={setContent}
              />
            </div>
          </div>

          {/* Sidebar - 25% da largura */}
          <div style={{ flex: '0 0 25%' }}>
            <Card title="Configurações" size="small">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  status: 'draft',
                  is_featured: false,
                  is_pinned: false,
                }}
              >
                {/* Título */}
                <Form.Item
                  name="title"
                  label="Título"
                  rules={[{ required: true, message: 'Título é obrigatório' }]}
                >
                  <Input 
                    placeholder="Digite o título do post..."
                    size="large"
                    style={{ 
                      fontSize: '18px',
                      fontWeight: 'bold',
                    }}
                  />
                </Form.Item>

                {/* Slug */}
                <Form.Item
                  name="slug"
                  label="Slug"
                  rules={[{ required: true, message: 'Slug é obrigatório' }]}
                >
                  <Input placeholder="titulo-do-post" />
                </Form.Item>

                {/* Categoria */}
                <Form.Item
                  name="category_id"
                  label="Categoria"
                  rules={[{ required: true, message: 'Categoria é obrigatória' }]}
                >
                  <Select 
                    placeholder="Selecione uma categoria"
                    loading={loadingCategories}
                  >
                    {categories
                      .filter(cat => cat.is_active)
                      .map(category => (
                        <Option key={category.id} value={category.id}>
                          {category.name}
                        </Option>
                      ))
                    }
                  </Select>
                </Form.Item>

                {/* Status */}
                <Form.Item
                  name="status"
                  label="Status"
                >
                  <Select>
                    <Option value="draft">Rascunho</Option>
                    <Option value="published">Publicado</Option>
                    <Option value="archived">Arquivado</Option>
                  </Select>
                </Form.Item>

                <Divider />

                {/* Resumo */}
                <Form.Item
                  name="excerpt"
                  label="Resumo"
                >
                  <TextArea 
                    rows={4}
                    placeholder="Digite um resumo do post..."
                  />
                </Form.Item>

                {/* Imagem Destacada */}
                <Form.Item
                  name="featured_image"
                  label="Imagem Destacada"
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Upload {...featuredImageUploadProps}>
                      <Button 
                        icon={<UploadOutlined />} 
                        loading={featuredImageUploading}
                        type="primary"
                      >
                        {currentFeaturedImage ? 'Alterar Imagem' : 'Carregar Imagem'}
                      </Button>
                    </Upload>
                    
                    {currentFeaturedImage && (
                      <>
                        <Button
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            form.setFieldsValue({ featured_image: undefined })
                          }}
                        >
                          Remover
                        </Button>
                        <Image
                          src={currentFeaturedImage}
                          alt="Imagem destacada atual"
                          width={100}
                          height={100}
                          style={{ objectFit: 'cover', borderRadius: '8px' }}
                        />
                      </>
                    )}
                  </div>
                </Form.Item>

                {/* Imagem Social */}
                <Form.Item
                  name="social_image"
                  label="Imagem para Redes Sociais"
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Upload {...socialImageUploadProps}>
                      <Button 
                        icon={<UploadOutlined />} 
                        loading={socialImageUploading}
                      >
                        {currentSocialImage ? 'Alterar Imagem' : 'Carregar Imagem'}
                      </Button>
                    </Upload>
                    
                    {currentSocialImage && (
                      <>
                        <Button
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            form.setFieldsValue({ social_image: undefined })
                          }}
                        >
                          Remover
                        </Button>
                        <Image
                          src={currentSocialImage}
                          alt="Imagem social atual"
                          width={100}
                          height={100}
                          style={{ objectFit: 'cover', borderRadius: '8px' }}
                        />
                      </>
                    )}
                  </div>
                </Form.Item>

                <Divider />

                {/* Opções */}
                <Form.Item
                  name="is_featured"
                  label="Post em Destaque"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="is_pinned"
                  label="Post Fixo"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Divider />

                {/* SEO */}
                <Form.Item
                  name="meta_title"
                  label="Meta Título"
                >
                  <Input placeholder="Título para SEO" />
                </Form.Item>

                <Form.Item
                  name="meta_description"
                  label="Meta Descrição"
                >
                  <TextArea 
                    rows={3}
                    placeholder="Descrição para SEO..."
                  />
                </Form.Item>

                <Form.Item
                  name="key_word_seo"
                  label="Palavras-chave"
                >
                  <Input placeholder="palavra1, palavra2, palavra3" />
                </Form.Item>

                <Divider />

                {/* Data de Publicação */}
                <Form.Item
                  name="published_at"
                  label="Data de Publicação"
                >
                  <DatePicker 
                    showTime 
                    style={{ width: '100%' }}
                    placeholder="Selecione data e hora"
                  />
                </Form.Item>

                <Divider />

                {/* Botões */}
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={loading}
                    onClick={() => form.submit()}
                    style={{ width: '100%' }}
                  >
                    Publicar
                  </Button>
                  <Button 
                    onClick={() => form.submit()}
                    loading={loading}
                    style={{ width: '100%' }}
                  >
                    Salvar Rascunho
                  </Button>
                  <Button 
                    onClick={() => router.push('/adm/posts')}
                    style={{ width: '100%' }}
                  >
                    Cancelar
                  </Button>
                </Space>
              </Form>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </>
  )
} 