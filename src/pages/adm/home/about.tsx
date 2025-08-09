import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Switch,
  Button,
  Card,
  message,
  Space,
  Typography,
  Divider,
} from 'antd'
import {
  SaveOutlined,
} from '@ant-design/icons'
import AdminLayout from '../../../components/AdminLayout'
import Head from 'next/head'
import ImageUpload from '../../../components/ImageUpload'
import dynamic from 'next/dynamic'

// Importar CKEditor dinamicamente para evitar problemas de SSR
const PostEditor = dynamic(() => import('../../../components/PostEditor'), {
  ssr: false,
  loading: () => <div>Carregando editor...</div>
})

const { Title, Text } = Typography

interface HomeAboutData {
  id?: number
  title: string
  content: string
  photo?: string
  download_button_text: string
  download_file?: string
  is_active: boolean
}

export default function HomeAboutPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [homeAboutData, setHomeAboutData] = useState<HomeAboutData | null>(null)
  const [editorContent, setEditorContent] = useState('')

  const fetchHomeAbout = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pg/home-about')
      const data = await response.json()
      
      if (data.homeAbout) {
        const aboutData = data.homeAbout
        setHomeAboutData(aboutData)
        setEditorContent(aboutData.content)
        form.setFieldsValue({
          title: aboutData.title,
          download_button_text: aboutData.download_button_text,
          photo: aboutData.photo,
          download_file: aboutData.download_file,
          is_active: aboutData.is_active,
        })
      } else {
        // Valores padrão se não há conteúdo
        form.setFieldsValue({
          title: 'Sobre Andre Paravela',
          download_button_text: 'Baixe o novo material',
          is_active: true,
        })
        setEditorContent('<p>Formado em Ciências contábeis e em direito pela <a href="https://www.puc.br/campinas" target="_blank">PUC</a> de Campinas, com pós graduação em Finanças pela <a href="https://www.usp.br/esalq" target="_blank">USP Esalq</a>, executivo de Finanças Global com mais de 20 anos de experiência em corporações multinacionais e firmas do Big Four.</p>')
      }
    } catch (error) {
      console.error('Erro ao buscar conteúdo:', error)
      message.error('Erro ao carregar conteúdo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHomeAbout()
  }, [])

  const handleSave = async (values: any) => {
    try {
      setSaving(true)

      const submitData = {
        ...values,
        content: editorContent,
        id: homeAboutData?.id
      }

      const url = '/api/pg/home-about'
      const method = homeAboutData?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (response.ok) {
        message.success(
          homeAboutData?.id 
            ? 'Conteúdo atualizado com sucesso'
            : 'Conteúdo criado com sucesso'
        )
        fetchHomeAbout() // Recarregar dados
      } else {
        message.error(data.message || 'Erro ao salvar conteúdo')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      message.error('Erro ao salvar conteúdo')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = (url: string) => {
    form.setFieldsValue({ photo: url })
    message.success('Foto carregada com sucesso')
  }

  const handleFileUpload = (url: string) => {
    form.setFieldsValue({ download_file: url })
    message.success('Arquivo carregado com sucesso')
  }

  return (
    <>
      <Head>
        <title>Home - Sobre - Globaliza Contabil</title>
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
              <Title level={2} style={{ margin: 0, color: '#001529' }}>
                Home - Seção Sobre
              </Title>
              <Text type="secondary">
                Configure o conteúdo da seção "Sobre" na página inicial
              </Text>
            </div>
          </div>

          <Card loading={loading}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                is_active: true,
              }}
            >
              <Form.Item
                name="title"
                label="Título da Seção"
                rules={[{ required: true, message: 'Título é obrigatório' }]}
              >
                <Input 
                  placeholder="Ex: Sobre Andre Paravela"
                  size="large"
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

              <Divider />

              <Title level={4}>Foto do Perfil</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                Carregue uma foto para o perfil. Se não carregar nenhuma, será usada a foto padrão.
              </Text>

              <Form.Item name="photo">
                <ImageUpload
                  onUploadSuccess={handlePhotoUpload}
                  onUploadError={(error) => message.error(`Erro no upload: ${error}`)}
                  value={form.getFieldValue('photo')}
                />
              </Form.Item>

              <Divider />

              <Title level={4}>Botão de Download</Title>

              <Form.Item
                name="download_button_text"
                label="Texto do Botão"
                rules={[{ required: true, message: 'Texto do botão é obrigatório' }]}
              >
                <Input 
                  placeholder="Ex: Baixe o novo material"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Arquivo para Download"
              >
                <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                  Carregue um arquivo (PDF, DOC, etc.) que será baixado quando o usuário clicar no botão.
                </Text>
                <ImageUpload
                  onUploadSuccess={handleFileUpload}
                  onUploadError={(error) => message.error(`Erro no upload: ${error}`)}
                  value={form.getFieldValue('download_file')}
                />
              </Form.Item>

              <Divider />

              <Form.Item
                name="is_active"
                label="Ativo"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={saving}
                    icon={<SaveOutlined />}
                    size="large"
                  >
                    {homeAboutData?.id ? 'Atualizar' : 'Salvar'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </AdminLayout>
    </>
  )
}
