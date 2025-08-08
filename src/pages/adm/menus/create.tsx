import React, { useState } from 'react'
import {
  Button,
  Input,
  Select,
  Card,
  Typography,
  Form,
  message,
  Space,
  Divider,
} from 'antd'
import {
  SaveOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import Head from 'next/head'
import AdminLayout from '@/components/AdminLayout'
import { useRouter } from 'next/router'

const { Title, Text } = Typography
const { Option } = Select

interface CreateMenuForm {
  name: string
  location: string
  is_active: boolean
}

export default function CreateMenu() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const router = useRouter()
  const [messageApi, contextHolder] = message.useMessage()

  const handleSubmit = async (values: CreateMenuForm) => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/pg/menus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        messageApi.success('Menu criado com sucesso!')
        router.push('/adm/menus')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao criar menu')
      }
    } catch (error) {
      console.error('❌ Erro ao criar menu:', error)
      messageApi.error(error instanceof Error ? error.message : 'Erro ao criar menu')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/adm/menus')
  }

  return (
    <AdminLayout>
      {contextHolder}
      <Head>
        <title>Criar Menu - Admin</title>
      </Head>

      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleCancel}
              type="text"
            >
              Voltar
            </Button>
          </Space>
          <Title level={2} style={{ margin: '16px 0 8px 0', color: '#1890ff' }}>
            Criar Novo Menu
          </Title>
          <Text type="secondary">
            Configure as informações do novo menu
          </Text>
        </div>

        {/* Formulário */}
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              is_active: true,
              location: 'header'
            }}
          >
            <Form.Item
              label="Nome do Menu"
              name="name"
              rules={[
                { required: true, message: 'Por favor, insira o nome do menu' },
                { min: 2, message: 'O nome deve ter pelo menos 2 caracteres' }
              ]}
            >
              <Input 
                placeholder="Ex: Menu Principal" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Localização"
              name="location"
              rules={[
                { required: true, message: 'Por favor, selecione a localização' }
              ]}
            >
              <Select size="large" placeholder="Selecione a localização">
                <Option value="header">Cabeçalho</Option>
                <Option value="footer">Rodapé</Option>
                <Option value="sidebar">Barra Lateral</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Status"
              name="is_active"
            >
              <Select size="large">
                <Option value={true}>Ativo</Option>
                <Option value={false}>Inativo</Option>
              </Select>
            </Form.Item>

            <Divider />

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  size="large"
                >
                  Criar Menu
                </Button>
                <Button
                  onClick={handleCancel}
                  size="large"
                >
                  Cancelar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  )
}
