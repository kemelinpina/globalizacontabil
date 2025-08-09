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
} from 'antd'
import {
  SaveOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import AdminLayout from '../../../components/AdminLayout'
import Head from 'next/head'
import { useRouter } from 'next/router'
import ImageUpload from '../../../components/ImageUpload'
import dynamic from 'next/dynamic'
import { useAuth } from '../../../contexts/AuthContext'
import dayjs from 'dayjs'

// Importar CKEditor dinamicamente para evitar problemas de SSR
const PostEditor = dynamic(() => import('../../../components/PostEditor'), {
  ssr: false,
  loading: () => <div>Carregando editor...</div>
})

const { Title, Text } = Typography
const { TextArea } = Input

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
  published_at?: any
}

export default function CreatePagePage() {
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [editorContent, setEditorContent] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  const handleSave = async (values: FormValues) => {
    try {
      setSaving(true)

      const submitData = {
        ...values,
        content: editorContent,
        author_id: user?.id,
        published_at: values.published_at ? values.published_at.toISOString() : null
      }

      const response = await fetch('/api/pg/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (response.ok) {
        message.success('Página criada com sucesso')
        router.push('/adm/pages')
      } else {
        message.error(data.message || 'Erro ao criar página')
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

  return (
    <>
      <Head>
        <title>Nova Página - Globaliza Contabil</title>
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
                Nova Página
              </Title>
              <Text type="secondary">
                Crie uma nova página para o site
              </Text>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={{
              status: 'draft',
              template: 'default',
              is_featured: false,
            }}
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
                        Criar Página
                      </Button>
                    </Space>
                  </Form.Item>
                </Card>
              </Col>
            </Row>
          </Form>
        </div>
      </AdminLayout>
    </>
  )
}
