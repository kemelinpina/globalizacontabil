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
  ColorPicker,
} from 'antd'
import {
  SaveOutlined,
} from '@ant-design/icons'
import AdminLayout from '../../../components/AdminLayout'
import Head from 'next/head'
import ImageUpload from '../../../components/ImageUpload'

const { Title, Text } = Typography
const { TextArea } = Input

interface BannerWhatsAppData {
  id?: number
  title: string
  description?: string
  button_text: string
  whatsapp_link: string
  background_image?: string
  background_color: string
  is_active: boolean
}

export default function BannerWhatsAppPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bannerData, setBannerData] = useState<BannerWhatsAppData | null>(null)

  const fetchBannerData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pg/banner-whatsapp')
      const data = await response.json()
      
      if (data.bannerWhatsApp) {
        const banner = data.bannerWhatsApp
        setBannerData(banner)
        form.setFieldsValue({
          title: banner.title,
          description: banner.description,
          button_text: banner.button_text,
          whatsapp_link: banner.whatsapp_link,
          background_image: banner.background_image,
          background_color: banner.background_color,
          is_active: banner.is_active,
        })
      } else {
        // Valores padrão se não há banner configurado
        form.setFieldsValue({
          title: 'Acesse nosso grupo de WhatsApp',
          button_text: 'Entrar para o grupo',
          whatsapp_link: 'https://wa.me/5511999999999',
          background_color: '#013F71',
          is_active: true,
        })
      }
    } catch (error) {
      console.error('Erro ao buscar banner:', error)
      message.error('Erro ao carregar banner')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBannerData()
  }, [])

  const handleSave = async (values: any) => {
    try {
      setSaving(true)

      // Processar cor
      let colorValue = values.background_color
      if (typeof colorValue === 'object' && colorValue && 'toHexString' in colorValue) {
        colorValue = (colorValue as { toHexString: () => string }).toHexString()
      }

      const submitData = {
        ...values,
        background_color: colorValue,
        id: bannerData?.id
      }

      const url = '/api/pg/banner-whatsapp'
      const method = bannerData?.id ? 'PUT' : 'POST'

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
          bannerData?.id 
            ? 'Banner atualizado com sucesso'
            : 'Banner criado com sucesso'
        )
        fetchBannerData() // Recarregar dados
      } else {
        message.error(data.message || 'Erro ao salvar banner')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      message.error('Erro ao salvar banner')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = (url: string) => {
    form.setFieldsValue({ background_image: url })
    message.success('Imagem de background carregada com sucesso')
  }

  return (
    <>
      <Head>
        <title>Banner WhatsApp - Globaliza Contabil</title>
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
                Banner WhatsApp
              </Title>
              <Text type="secondary">
                Configure o banner do WhatsApp na página inicial
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
                background_color: '#013F71'
              }}
            >
              <Form.Item
                name="title"
                label="Título (Chamada Principal)"
                rules={[{ required: true, message: 'Título é obrigatório' }]}
              >
                <Input 
                  placeholder="Ex: Acesse nosso grupo de WhatsApp"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="Descrição (opcional)"
              >
                <TextArea 
                  placeholder="Descrição adicional para o banner..."
                  rows={3}
                />
              </Form.Item>

              <Divider />

              <Title level={4}>Botão WhatsApp</Title>

              <Form.Item
                name="button_text"
                label="Texto do Botão"
                rules={[{ required: true, message: 'Texto do botão é obrigatório' }]}
              >
                <Input 
                  placeholder="Ex: Entrar para o grupo"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="whatsapp_link"
                label="Link do WhatsApp"
                rules={[
                  { required: true, message: 'Link do WhatsApp é obrigatório' },
                  { 
                    pattern: /^https:\/\/wa\.me\/\d+/, 
                    message: 'Use o formato: https://wa.me/5511999999999' 
                  }
                ]}
              >
                <Input 
                  placeholder="https://wa.me/5511999999999"
                  size="large"
                />
              </Form.Item>

              <Divider />

              <Title level={4}>Aparência</Title>

              <Form.Item
                name="background_color"
                label="Cor de Filtro/Background"
                rules={[{ required: true, message: 'Cor de background é obrigatória' }]}
              >
                <ColorPicker 
                  format="hex"
                  presets={[
                    {
                      label: 'Cores da Marca',
                      colors: ['#013F71', '#66CC33', '#E82FA4', '#0077B5', '#1877F2'],
                    },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="Imagem de Background (opcional)"
              >
                <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                  Carregue uma imagem de fundo. A cor selecionada acima será aplicada como filtro sobre a imagem.
                  Se não carregar nenhuma imagem, será usado apenas a cor sólida.
                </Text>
                <ImageUpload
                  onUploadSuccess={handleImageUpload}
                  onUploadError={(error) => message.error(`Erro no upload: ${error}`)}
                  value={form.getFieldValue('background_image')}
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
                    {bannerData?.id ? 'Atualizar' : 'Salvar'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          {/* Preview */}
          {form.getFieldValue('title') && (
            <>
              <Divider />
              <Card title="Preview" style={{ marginTop: '24px' }}>
                <div 
                  style={{
                    backgroundColor: form.getFieldValue('background_color') || '#013F71',
                    backgroundImage: form.getFieldValue('background_image') 
                      ? `url(${form.getFieldValue('background_image')})` 
                      : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundBlendMode: form.getFieldValue('background_image') ? 'overlay' : 'normal',
                    padding: '32px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    color: 'white',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <h3 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: 'white' }}>
                    {form.getFieldValue('title') || 'Título do Banner'}
                  </h3>
                  
                  {form.getFieldValue('description') && (
                    <p style={{ fontSize: '16px', margin: 0, color: 'white' }}>
                      {form.getFieldValue('description')}
                    </p>
                  )}
                  
                  <button
                    style={{
                      backgroundColor: '#25D366',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    📱 {form.getFieldValue('button_text') || 'Texto do Botão'}
                  </button>
                </div>
              </Card>
            </>
          )}
        </div>
      </AdminLayout>
    </>
  )
}
