import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Select,
  Switch,
  Button,
  Card,
  message,
  Space,
  Typography,
  Divider,
  DatePicker,
  Row,
  Col,
  Spin,
} from 'antd'
import {
  SaveOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import AdminLayout from '../../../../components/AdminLayout'
import Head from 'next/head'
import { useRouter } from 'next/router'
import ImageUpload from '../../../../components/ImageUpload'
import dynamic from 'next/dynamic'
import { useAuth } from '../../../../contexts/AuthContext'
import dayjs from 'dayjs'

// Importar CKEditor dinamicamente para evitar problemas de SSR
const PostEditor = dynamic(() => import('../../../../components/PostEditor'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      border: '1px solid #d9d9d9', 
      borderRadius: '6px', 
      padding: '16px',
      background: '#fafafa'
    }}>
      {/* Skeleton para barra de ferramentas */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div
            key={item}
            style={{
              width: '32px',
              height: '32px',
              background: '#e6e6e6',
              borderRadius: '4px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />
        ))}
      </div>
      
      {/* Skeleton para área de conteúdo */}
      <div style={{ 
        minHeight: '200px',
        background: '#e6e6e6',
        borderRadius: '4px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
})

const { Title, Text } = Typography
const { TextArea } = Input

interface Page {
  id: number
  title: string
  content: string
  slug: string
  excerpt?: string
  featured_image?: string
  social_image?: string
  status: string
  meta_title?: string
  meta_description?: string
  key_word_seo?: string
  is_featured: boolean
  template: string
  custom_css?: string
  custom_js?: string
  published_at?: string
  created_at: string
  updated_at: string
  author: {
    id: number
    name: string
    email: string
  }
}

interface FormValues {
  title: string
  content: string
  excerpt?: string
  featured_image?: string
  social_image?: string
  status: string
  meta_title?: string
  meta_description?: string
  key_word_seo?: string
  is_featured: boolean
  template: string
  custom_css?: string
  custom_js?: string
  published_at?: dayjs.Dayjs
}

export default function EditPagePage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editorContent, setEditorContent] = useState('')
  const [page, setPage] = useState<Page | null>(null)
  const router = useRouter()
  const { user } = useAuth()
  const { id } = router.query

  useEffect(() => {
    if (id) {
      fetchPage()
    }
  }, [id])

  const fetchPage = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/pg/pages/${id}`)
      const data = await response.json()
      
      if (response.ok) {
        const pageData = data.page
        setPage(pageData)
        setEditorContent(pageData.content)
        
        form.setFieldsValue({
          title: pageData.title,
          excerpt: pageData.excerpt,
          featured_image: pageData.featured_image,
          social_image: pageData.social_image,
          status: pageData.status,
          meta_title: pageData.meta_title,
          meta_description: pageData.meta_description,
          key_word_seo: pageData.key_word_seo,
          is_featured: pageData.is_featured,
          template: pageData.template,
          custom_css: pageData.custom_css,
          custom_js: pageData.custom_js,
          published_at: pageData.published_at ? dayjs(pageData.published_at) : null,
        })
      } else {
        message.error('Erro ao carregar página')
        router.push('/adm/pages')
      }
    } catch (error) {
      console.error('Erro ao buscar página:', error)
      message.error('Erro ao carregar página')
      router.push('/adm/pages')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (values: FormValues) => {
    try {
      setSaving(true)

      const submitData = {
        ...values,
        content: editorContent,
        author_id: user?.id,
        published_at: values.published_at ? values.published_at.toISOString() : null
      }

      const response = await fetch(`/api/pg/pages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (response.ok) {
        message.success('Página atualizada com sucesso')
        router.push('/adm/pages')
      } else {
        message.error(data.message || 'Erro ao atualizar página')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      message.error('Erro ao salvar página')
    } finally {
      setSaving(false)
    }
  }

  const handleFeaturedImageUpload = (url: string) => {
    form.setFieldsValue({ featured_image: url })
    message.success('Imagem de destaque carregada com sucesso')
  }

  const handleSocialImageUpload = (url: string) => {
    form.setFieldsValue({ social_image: url })
    message.success('Imagem social carregada com sucesso')
  }

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh' 
        }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Editar Página - {page?.title} - Globaliza Contabil</title>
      </Head>
      
      <AdminLayout>
        <div style={{ padding: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/adm/pages')}
                style={{ marginBottom: '16px' }}
              >
                Voltar para Páginas
              </Button>
              <Title level={2} style={{ margin: 0, color: '#001529' }}>
                Editar Página
              </Title>
              <Text type="secondary">
                Editando: {page?.title}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                URL: /page/{page?.slug}
              </Text>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
          >
            <Row gutter={24}>
              <Col span={16}>
                <Card title="Conteúdo da Página">
                  <Form.Item
                    name="title"
                    label="Título"
                    rules={[{ required: true, message: 'Título é obrigatório' }]}
                  >
                    <Input 
                      placeholder="Digite o título da página"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="excerpt"
                    label="Resumo (opcional)"
                  >
                    <TextArea 
                      placeholder="Breve descrição da página..."
                      rows={3}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Conteúdo"
                    required
                  >
                    <PostEditor
                      value={editorContent}
                      onChange={setEditorContent}
                    />
                  </Form.Item>
                </Card>

                {/* SEO */}
                <Card title="SEO" style={{ marginTop: '24px' }}>
                  <Form.Item
                    name="meta_title"
                    label="Meta Título"
                  >
                    <Input placeholder="Título para motores de busca" />
                  </Form.Item>

                  <Form.Item
                    name="meta_description"
                    label="Meta Descrição"
                  >
                    <TextArea 
                      placeholder="Descrição para motores de busca"
                      rows={3}
                      maxLength={160}
                    />
                  </Form.Item>

                  <Form.Item
                    name="key_word_seo"
                    label="Palavras-chave"
                  >
                    <Input placeholder="palavra1, palavra2, palavra3" />
                  </Form.Item>
                </Card>

                {/* Avançado */}
                <Card title="Personalização (Avançado)" style={{ marginTop: '24px' }}>
                  <Form.Item
                    name="custom_css"
                    label="CSS Personalizado"
                  >
                    <TextArea 
                      placeholder="/* CSS personalizado para esta página */"
                      rows={6}
                    />
                  </Form.Item>

                  <Form.Item
                    name="custom_js"
                    label="JavaScript Personalizado"
                  >
                    <TextArea 
                      placeholder="// JavaScript personalizado para esta página"
                      rows={6}
                    />
                  </Form.Item>
                </Card>
              </Col>

              <Col span={8}>
                <Card title="Configurações">
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Status é obrigatório' }]}
                  >
                    <Select>
                      <Select.Option value="draft">Rascunho</Select.Option>
                      <Select.Option value="published">Publicado</Select.Option>
                      <Select.Option value="archived">Arquivado</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="template"
                    label="Template"
                    rules={[{ required: true, message: 'Template é obrigatório' }]}
                  >
                    <Select>
                      <Select.Option value="default">Padrão</Select.Option>
                      <Select.Option value="landing">Landing Page</Select.Option>
                      <Select.Option value="contact">Contato</Select.Option>
                      <Select.Option value="about">Sobre</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="published_at"
                    label="Data de Publicação"
                  >
                    <DatePicker 
                      showTime 
                      style={{ width: '100%' }}
                      placeholder="Selecione a data"
                    />
                  </Form.Item>

                  <Form.Item
                    name="is_featured"
                    label="Página em Destaque"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Divider />

                  <Form.Item
                    label="Imagem de Destaque"
                  >
                    <ImageUpload
                      onUploadSuccess={handleFeaturedImageUpload}
                      onUploadError={(error) => message.error(`Erro no upload: ${error}`)}
                      value={form.getFieldValue('featured_image')}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Imagem Social (Compartilhamento)"
                  >
                    <ImageUpload
                      onUploadSuccess={handleSocialImageUpload}
                      onUploadError={(error) => message.error(`Erro no upload: ${error}`)}
                      value={form.getFieldValue('social_image')}
                    />
                  </Form.Item>

                  <Divider />

                  <Form.Item>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Button
                        onClick={() => router.push('/adm/pages')}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={saving}
                        icon={<SaveOutlined />}
                      >
                        Atualizar Página
                      </Button>
                    </Space>
                  </Form.Item>
                </Card>

                {/* Informações da Página */}
                <Card title="Informações" style={{ marginTop: '24px' }}>
                  <Text strong>Slug:</Text>
                  <br />
                  <Text code>/page/{page?.slug}</Text>
                  
                  <br /><br />
                  
                  <Text strong>Autor:</Text>
                  <br />
                  <Text>{page?.author.name}</Text>
                  
                  <br /><br />
                  
                  <Text strong>Criado em:</Text>
                  <br />
                  <Text>{page ? new Date(page.created_at).toLocaleDateString('pt-BR') : ''}</Text>
                </Card>
              </Col>
            </Row>
          </Form>
        </div>
      </AdminLayout>
    </>
  )
}
