import React, { useState, useEffect } from 'react'
import {
  Button,
  Input,
  Select,
  Form,
  message,
  Card,
  Space,
  Divider,
  Switch,
  DatePicker,
} from 'antd'
import {
  SaveOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/router'
import AdminLayout from '../../../components/AdminLayout'
import PostEditor from '../../../components/PostEditor'
import ImageUpload from '../../../components/ImageUpload'
import { useAuth } from '../../../contexts/AuthContext'
import Head from 'next/head'

const { TextArea } = Input
const { Option } = Select

interface Category {
  id: number
  name: string
  is_active: boolean
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

export default function CreatePost() {
  const [form] = Form.useForm()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
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
                  <ImageUpload
                    placeholder="Clique para fazer upload da imagem destacada"
                    onUploadSuccess={(url) => form.setFieldsValue({ featured_image: url })}
                    onUploadError={(error) => message.error(error)}
                  />
                </Form.Item>

                {/* Imagem Social */}
                <Form.Item
                  name="social_image"
                  label="Imagem para Redes Sociais"
                >
                  <ImageUpload
                    placeholder="Clique para fazer upload da imagem para redes sociais"
                    onUploadSuccess={(url) => form.setFieldsValue({ social_image: url })}
                    onUploadError={(error) => message.error(error)}
                  />
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