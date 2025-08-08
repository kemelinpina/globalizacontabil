import React, { useState, useEffect, useCallback } from 'react'
import {
  Button,
  Input,
  Select,
  Table,
  Space,
  Card,
  Typography,
  Spin,
  Modal,
  message,
  Form,
  Divider,
  Tooltip,
  Switch,
  Tag,
  Popconfirm,
  Badge,
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  LinkOutlined,
  FolderOutlined,
  FileOutlined,
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
  children?: MenuItem[]
}

interface Menu {
  id: number
  name: string
  location: string
  is_active: boolean
  menu_items: MenuItem[]
}

export default function MenuDetails() {
  const router = useRouter()
  const { id } = router.query
  const menuId = parseInt(id as string)

  const [menu, setMenu] = useState<Menu | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [createForm] = Form.useForm()
  const [createLoading, setCreateLoading] = useState(false)
  const [parentItem, setParentItem] = useState<MenuItem | null>(null)
  
  const [messageApi, contextHolder] = message.useMessage()

  const fetchMenu = useCallback(async () => {
    if (!menuId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/pg/menus/${menuId}`)
      const data = await response.json()

      if (response.ok) {
        setMenu(data.menu)
      } else {
        throw new Error(data.message || 'Erro ao carregar menu')
      }
    } catch (error) {
      console.error('❌ Erro ao buscar menu:', error)
      messageApi.error('Erro ao carregar menu')
    } finally {
      setLoading(false)
    }
  }, [menuId, messageApi])

  useEffect(() => {
    fetchMenu()
  }, [fetchMenu])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
  }

  const handleDeleteItem = async (itemId?: number) => {
    const id = itemId || itemToDelete?.id
    if (!id) return

    try {
      const response = await fetch(`/api/pg/menu-items/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        messageApi.success('Item do menu excluído com sucesso')
        fetchMenu()
      } else {
        throw new Error('Erro ao excluir item do menu')
      }
    } catch (error) {
      console.error('❌ Erro ao excluir item do menu:', error)
      messageApi.error('Erro ao excluir item do menu')
    } finally {
      setDeleteModalVisible(false)
      setItemToDelete(null)
    }
  }

  const handleCreateItem = async (values: any) => {
    try {
      setCreateLoading(true)
      
      const response = await fetch('/api/pg/menu-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          menu_id: menuId,
          parent_id: parentItem?.id || null,
        }),
      })

      if (response.ok) {
        messageApi.success('Item do menu criado com sucesso!')
        setCreateModalVisible(false)
        setParentItem(null)
        createForm.resetFields()
        fetchMenu()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao criar item do menu')
      }
    } catch (error) {
      console.error('❌ Erro ao criar item do menu:', error)
      messageApi.error(error instanceof Error ? error.message : 'Erro ao criar item do menu')
    } finally {
      setCreateLoading(false)
    }
  }

  // Transforma a árvore de menus em dados para tabela expandível
  const transformToTableData = (items: MenuItem[]): any[] => {
    return items.map(item => ({
      key: `item-${item.id}`,
      id: item.id,
      isFolder: item.children && item.children.length > 0,
      title: item.title,
      url: item.url,
      target: item.target,
      order: item.order,
      is_active: item.is_active,
      parent_id: item.parent_id,
      children: item.children && item.children.length > 0 
        ? transformToTableData(item.children) 
        : undefined
    }))
  }

  const handleAddSubItem = (item: MenuItem) => {
    setParentItem(item)
    setCreateModalVisible(true)
  }

  const showCreateSubcategory = (item: MenuItem) => {
    createForm.resetFields()
    createForm.setFieldsValue({ parent_id: item.id.toString() })
    setParentItem(item)
    setCreateModalVisible(true)
  }

  const getLocationLabel = (location: string) => {
    const locations = {
      header: 'Cabeçalho',
      footer: 'Rodapé',
      sidebar: 'Barra Lateral'
    }
    return locations[location as keyof typeof locations] || location
  }

  const getTargetLabel = (target: string) => {
    const targets = {
      '_self': 'Mesma janela',
      '_blank': 'Nova janela',
      '_parent': 'Janela pai',
      '_top': 'Janela superior'
    }
    return targets[target as keyof typeof targets] || target
  }

  const columns = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (_: any, record: any) => (
        <Space>
          {record.isFolder ? (
            <FolderOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
          ) : (
            <FileOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
          )}
          <Text strong>{record.title}</Text>
        </Space>
      ),
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      width: 200,
      render: (value: string) => (
        <Space>
          <LinkOutlined style={{ color: '#52c41a' }} />
          <Text 
            code 
            style={{ 
              maxWidth: '150px', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              display: 'inline-block'
            }}
          >
            {value || '-'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Abrir em',
      dataIndex: 'target',
      key: 'target',
      width: 120,
      render: (value: string) => (
        <Tag color="blue">
          {getTargetLabel(value)}
        </Tag>
      ),
    },
    {
      title: 'Ordem',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      render: (value: number) => <Text>{value}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (value: boolean) => (
        <Switch
          checked={value}
          size="small"
          disabled
        />
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Editar">
            <EditOutlined
              style={{ fontSize: '16px', cursor: 'pointer' }}
              onClick={() => router.push(`/adm/menu-items/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Adicionar Subitem">
            <PlusOutlined
              style={{ fontSize: '16px', cursor: 'pointer' }}
              onClick={() => showCreateSubcategory(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Excluir item do menu?"
            onConfirm={() => handleDeleteItem(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <DeleteOutlined 
              style={{ 
                fontSize: '16px', 
                cursor: 'pointer', 
                color: '#ff4d4f' 
              }} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

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
        <title>{menu.name} - Detalhes do Menu - Admin</title>
      </Head>

      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push('/adm/menus')}
              type="text"
            >
              Voltar
            </Button>
          </Space>
          <Title level={2} style={{ margin: '16px 0 8px 0', color: '#1890ff' }}>
            {menu.name}
          </Title>
          <Space>
            <Badge
              color="blue"
              text={getLocationLabel(menu.location)}
            />
            <Badge
              status={menu.is_active ? 'success' : 'error'}
              text={menu.is_active ? 'Ativo' : 'Inativo'}
            />
          </Space>
        </div>

        {/* Filtros */}
        <Card style={{ marginBottom: '24px' }}>
          <Space size="middle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Space>
              <Input
                placeholder="Buscar itens..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 300 }}
              />
              <Select
                placeholder="Todos os status"
                value={selectedStatus}
                onChange={handleStatusChange}
                style={{ width: 150 }}
                allowClear
              >
                <Option value="true">Ativo</Option>
                <Option value="false">Inativo</Option>
              </Select>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
              size="large"
            >
              Novo Item
            </Button>
          </Space>
        </Card>

        {/* Lista de Itens */}
        <Card>
          {menu.menu_items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Nenhum item encontrado neste menu.
              </Text>
              <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
                Clique em "Novo Item" para adicionar o primeiro item.
              </Text>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={transformToTableData(menu.menu_items)}
              rowKey="key"
              pagination={false}
              expandable={{ 
                defaultExpandAllRows: true,
                indentSize: 24
              }}
              size="middle"
            />
          )}
        </Card>
      </div>

      {/* Modal de Criação */}
      <Modal
        title={parentItem ? `Novo Subitem de: ${parentItem.title}` : "Novo Item do Menu"}
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          setParentItem(null)
          createForm.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateItem}
          initialValues={{
            target: '_self',
            order: 0,
            is_active: true
          }}
        >
          <Form.Item
            label="Título"
            name="title"
            rules={[
              { required: true, message: 'Por favor, insira o título' },
              { min: 2, message: 'O título deve ter pelo menos 2 caracteres' }
            ]}
          >
            <Input placeholder="Ex: Página Inicial" size="large" />
          </Form.Item>

          <Form.Item
            label="URL"
            name="url"
          >
            <Input 
              placeholder="Ex: /, /blog, https://exemplo.com, #secao" 
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
                icon={<PlusOutlined />}
                loading={createLoading}
                size="large"
              >
                {parentItem ? 'Criar Subitem' : 'Criar Item'}
              </Button>
              <Button
                onClick={() => {
                  setCreateModalVisible(false)
                  setParentItem(null)
                  createForm.resetFields()
                }}
                size="large"
              >
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>


    </AdminLayout>
  )
}
