import React, { useState, useEffect } from 'react'
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
  Spin,
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

interface MenuItem {
  id: number
  title: string
  url: string | null
  target: string
  order: number
  is_active: boolean
  parent_id: number | null
  menu_id: number
}

interface EditMenuItemForm {
  title: string
  url: string
  target: string
  order: number
  is_active: boolean
}

export default function EditMenuItem() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null)
  const [form] = Form.useForm()
  const router = useRouter()
  const { id } = router.query
  const menuItemId = parseInt(id as string)
  
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    if (menuItemId) {
      fetchMenuItem()
    }
  }, [menuItemId])

  const fetchMenuItem = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/pg/menu-items/${menuItemId}`)
      const data = await response.json()

      if (response.ok) {
        setMenuItem(data.menuItem)
        form.setFieldsValue({
          title: data.menuItem.title,
          url: data.menuItem.url || '',
          target: data.menuItem.target,
          order: data.menuItem.order,
          is_active: data.menuItem.is_active
        })
      } else {
        throw new Error(data.message || 'Erro ao carregar item do menu')
      }
    } catch (error) {
      console.error('❌ Erro ao buscar item do menu:', error)
      messageApi.error('Erro ao carregar item do menu')
      router.push('/adm/menus')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: EditMenuItemForm) => {
    try {
      setSaving(true)
      
      const response = await fetch(`/api/pg/menu-items/${menuItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        messageApi.success('Item do menu atualizado com sucesso!')
        router.push(`/adm/menus/${menuItem?.menu_id}`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao atualizar item do menu')
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar item do menu:', error)
      messageApi.error(error instanceof Error ? error.message : 'Erro ao atualizar item do menu')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/adm/menus/${menuItem?.menu_id}`)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    )
  }

  if (!menuItem) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">Item do menu não encontrado</Text>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      {contextHolder}
      <Head>
        <title>Editar Item do Menu - Admin</title>
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
            Editar Item do Menu
          </Title>
          <Text type="secondary">
            Atualize as informações do item do menu
          </Text>
        </div>

        {/* Formulário */}
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="Título"
              name="title"
              rules={[
                { required: true, message: 'Por favor, insira o título' },
                { min: 2, message: 'O título deve ter pelo menos 2 caracteres' }
              ]}
            >
              <Input 
                placeholder="Ex: Página Inicial" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="URL"
              name="url"
            >
              <Input 
                placeholder="Ex: /" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Abrir em"
              name="target"
            >
              <Select size="large">
                <Option value="_self">Mesma janela</Option>
                <Option value="_blank">Nova janela</Option>
                <Option value="_parent">Janela pai</Option>
                <Option value="_top">Janela superior</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Ordem"
              name="order"
            >
              <Input type="number" size="large" />
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
                  loading={saving}
                  size="large"
                >
                  Salvar Alterações
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
