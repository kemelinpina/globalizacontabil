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
  Upload,
  Spin,
} from 'antd'
import dayjs from 'dayjs'
import {
  SaveOutlined,
  EyeOutlined,
  UploadOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/router'
import AdminLayout from '../../../../components/AdminLayout'
import PostEditor from '../../../../components/PostEditor'
import { useAuth } from '../../../../contexts/AuthContext'
import Head from 'next/head'

const { TextArea } = Input
const { Option } = Select

interface Category {
  id: number
  name: string
  is_active: boolean
}

interface Post {
  id: number
  title: string
  slug: string
  content: string
  excerpt?: string
  status: string
  meta_title?: string
  meta_description?: string
  key_word_seo?: string
  featured_image?: string
  social_image?: string
  is_featured: boolean
  is_pinned: boolean
  reading_time?: number
  tags?: string
  published_at?: string
  category_id: number
  author_id: number
  category: {
    id: number
    name: string
  }
  author: {
    id: number
    name: string
  }
}

interface FormValues {
  title: string
  slug: string
  category_id: string
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

export default function EditPost() {
  const [form] = Form.useForm()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingPost, setLoadingPost] = useState(true)
  const [content, setContent] = useState('')
  const [post, setPost] = useState<Post | null>(null)
  const router = useRouter()
  const { id } = router.query
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

  // Buscar post
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return

      try {
        const response = await fetch(`/api/pg/posts/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Erro ao carregar post')
        }

        setPost(data.post)
        setContent(data.post.content)

                            // Preencher formulário
                    form.setFieldsValue({
                      title: data.post.title,
                      slug: data.post.slug,
                      category_id: data.post.category_id.toString(),
                      status: data.post.status,
                      excerpt: data.post.excerpt,
                      meta_title: data.post.meta_title,
                      meta_description: data.post.meta_description,
                      key_word_seo: data.post.key_word_seo,
                      featured_image: data.post.featured_image,
                      social_image: data.post.social_image,
                      is_featured: data.post.is_featured,
                      is_pinned: data.post.is_pinned,
                      reading_time: data.post.reading_time,
                      tags: data.post.tags,
                      published_at: data.post.published_at ? dayjs(data.post.published_at) : null,
                    })

      } catch (error) {
        console.error('Erro ao buscar post:', error)
        message.error('Erro ao carregar post')
        router.push('/adm/posts')
      } finally {
        setLoadingPost(false)
      }
    }

    fetchPost()
  }, [id, form, router])

  const handleSubmit = async (values: FormValues) => {
    if (!content.trim()) {
      message.error('O conteúdo é obrigatório')
      return
    }

    if (!user) {
      message.error('Usuário não autenticado')
      return
    }

    if (!post) {
      message.error('Post não encontrado')
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
        category_id: parseInt(values.category_id),
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

      const response = await fetch(`/api/pg/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar post')
      }

      message.success('Post atualizado com sucesso!')
      router.push('/adm/posts')

    } catch (error) {
      console.error('Erro ao atualizar post:', error)
      message.error(error instanceof Error ? error.message : 'Erro ao atualizar post')
    } finally {
      setLoading(false)
    }
  }

  if (loadingPost) {
    return (
      <AdminLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: 'calc(100vh - 140px)'
        }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    )
  }

  if (!post) {
    return (
      <AdminLayout>
        <div style={{ padding: '24px' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Post não encontrado</h2>
            <Button onClick={() => router.push('/adm/posts')}>
              Voltar para Posts
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Editar Post - Globaliza Contabil</title>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Button 
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.push('/adm/posts')}
                >
                  Voltar
                </Button>
                <h1 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  margin: 0 
                }}>
                  Editar Post
                </h1>
              </div>
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
                  Atualizar
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
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
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
                    Atualizar
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
