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

interface Menu {
  id: number
  name: string
  location: string
  is_active: boolean
}

interface EditMenuForm {
  name: string
  location: string
  is_active: boolean
}

export default function EditMenu() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [menu, setMenu] = useState<Menu | null>(null)
  const [form] = Form.useForm()
  const router = useRouter()
  const { id } = router.query
  const menuId = parseInt(id as string)
  
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    if (menuId) {
      fetchMenu()
    }
  }, [menuId])

  const fetchMenu = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/pg/menus/${menuId}`)
      const data = await response.json()

      if (response.ok) {
        setMenu(data.menu)
        form.setFieldsValue({
          name: data.menu.name,
          location: data.menu.location,
          is_active: data.menu.is_active
        })
      } else {
        throw new Error(data.message || 'Erro ao carregar menu')
      }
    } catch (error) {
      console.error('❌ Erro ao buscar menu:', error)
      messageApi.error('Erro ao carregar menu')
      router.push('/adm/menus')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: EditMenuForm) => {
    try {
      setSaving(true)
      
      const response = await fetch(`/api/pg/menus/${menuId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        messageApi.success('Menu atualizado com sucesso!')
        router.push('/adm/menus')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao atualizar menu')
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar menu:', error)
      messageApi.error(error instanceof Error ? error.message : 'Erro ao atualizar menu')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/adm/menus')
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

  if (!menu) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">Menu não encontrado</Text>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      {contextHolder}
      <Head>
        <title>Editar Menu - Admin</title>
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
            Editar Menu
          </Title>
          <Text type="secondary">
            Atualize as informações do menu
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
