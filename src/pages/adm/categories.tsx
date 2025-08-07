import React, { useState, useEffect, useCallback } from 'react'
import { Box, Heading } from '@chakra-ui/react'
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Tag,
  Table,
  Switch,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/AdminLayout'
import Head from 'next/head'

interface Category {
  id: number
  name: string
  description: string | null
  url: string | null
  full_url: string | null
  favorite: boolean
  is_main: boolean
  is_active: boolean
  order: number
  created_at: string
  _count: {
    posts: number
  }
}

interface FormValues {
  name: string
  description?: string
  url?: string
  favorite: boolean
  is_main: boolean
  is_active: boolean
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form] = Form.useForm()
  const router = useRouter()

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/pg/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      message.error('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleCreate = () => {
    setEditingCategory(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      url: category.url,
      favorite: category.favorite,
      is_main: category.is_main,
      is_active: category.is_active,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/pg/categories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        message.success('Categoria excluída com sucesso')
        fetchCategories()
      } else {
        const data = await response.json()
        message.error(data.message || 'Erro ao excluir categoria')
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      message.error('Erro ao excluir categoria')
    }
  }

  const handleSubmit = async (values: FormValues) => {
    try {
      const url = editingCategory 
        ? `/api/pg/categories/${editingCategory.id}`
        : '/api/pg/create-category'
      
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (response.ok) {
        message.success(
          editingCategory 
            ? 'Categoria atualizada com sucesso'
            : 'Categoria criada com sucesso'
        )
        setModalVisible(false)
        fetchCategories()
      } else {
        message.error(data.message || 'Erro ao salvar categoria')
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      message.error('Erro ao salvar categoria')
    }
  }

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Category) => (
        <Space>
          <span style={{ fontWeight: 500 }}>{text}</span>
          {record.favorite && <Tag color="gold">Favorita</Tag>}
          {record.is_main && <Tag color="blue">Principal</Tag>}
        </Space>
      ),
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
      ellipsis: true,
    },
    {
      title: 'URL',
      dataIndex: 'full_url',
      key: 'url',
      render: (text: string) => text || '-',
    },
    {
      title: 'Posts',
      dataIndex: '_count',
      key: 'posts',
      render: (count: { posts: number }) => (
        <Tag color="green">{count.posts} posts</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Ativa' : 'Inativa'}
        </Tag>
      ),
    },
    {
      title: 'Ordem',
      dataIndex: 'order',
      key: 'order',
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: Category) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => router.push(`/adm/categories/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Tem certeza que deseja excluir esta categoria?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Head>
        <title>Categorias - Globaliza Contabil</title>
      </Head>

      <AdminLayout>
        <Box style={{ padding: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <Heading size="lg" style={{ margin: 0 }}>
              Categorias
            </Heading>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Nova Categoria
            </Button>
          </div>

          <Box
            style={{
              background: 'white',
              borderRadius: '8px',
              padding: '24px',
            }}
          >
            <Table
              columns={columns}
              dataSource={categories}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} de ${total} categorias`,
              }}
            />
          </Box>
        </Box>

        <Modal
          title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              favorite: false,
              is_main: false,
              is_active: true,
            }}
          >
            <Form.Item
              name="name"
              label="Nome"
              rules={[{ required: true, message: 'Nome é obrigatório' }]}
            >
              <Input placeholder="Digite o nome da categoria" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Descrição"
            >
              <Input.TextArea 
                rows={3}
                placeholder="Digite uma descrição para a categoria"
              />
            </Form.Item>

            <Form.Item
              name="url"
              label="URL"
            >
              <Input placeholder="ex: contabilidade, impostos, legislacao" />
            </Form.Item>

            <Form.Item
              name="favorite"
              label="Favorita"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="is_main"
              label="Categoria Principal"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="is_active"
              label="Ativa"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingCategory ? 'Atualizar' : 'Criar'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  Cancelar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </AdminLayout>
    </>
  )
} 