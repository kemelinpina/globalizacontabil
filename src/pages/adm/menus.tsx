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

  Badge,
  Form,
  Divider,
  Tooltip,
  Switch,
  Tag,
  Popconfirm,
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,


  MenuOutlined,
  FolderOutlined,
  FileOutlined,
  LinkOutlined,
} from '@ant-design/icons'
import Head from 'next/head'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
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
  created_at: string
  updated_at: string
  menu_items?: MenuItem[]
  _count?: {
    menu_items: number
  }
}

type TableRecord = {
  key: string
  id: number
  isMenu: boolean
  isFolder: boolean
  name?: string
  title?: string
  location?: string
  url?: string | null
  target?: string
  order?: number
  is_active: boolean
  created_at?: string
  itemCount?: number
  menuId?: number
  parent_id?: number | null
  children?: TableRecord[]
}

export default function Menus() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  
  // Estados para gerenciamento de itens
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  
  // Estados para modal de criação/edição de item
  const [createItemModalVisible, setCreateItemModalVisible] = useState(false)
  const [editItemModalVisible, setEditItemModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [parentItem, setParentItem] = useState<MenuItem | null>(null)
  const [itemForm] = Form.useForm()
  const [itemLoading, setItemLoading] = useState(false)
  
  const router = useRouter()
  const [messageApi, contextHolder] = message.useMessage()

  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      if (selectedLocation) {
        params.append('location', selectedLocation)
      }

      // Buscar menus com items incluídos
      params.append('include_items', 'true')

      const response = await fetch(`/api/pg/menus?${params}`)
      const data = await response.json()

      setMenus(data.menus || [])
    } catch (error) {
      console.error('❌ Erro ao buscar menus:', error)
      messageApi.error('Erro ao carregar menus')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedLocation, messageApi])

  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value)
  }

  const handleDeleteMenu = async () => {
    if (!menuToDelete) return

    try {
      const response = await fetch(`/api/pg/menus/${menuToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        messageApi.success('Menu excluído com sucesso')
        fetchMenus()
      } else {
        throw new Error('Erro ao excluir menu')
      }
    } catch (error) {
      console.error('❌ Erro ao excluir menu:', error)
      messageApi.error('Erro ao excluir menu')
    } finally {
      setDeleteModalVisible(false)
      setMenuToDelete(null)
    }
  }



  // Transforma menus e itens em dados unificados para a tabela
  const transformMenusToTableData = (menus: Menu[]): TableRecord[] => {
    return menus.map(menu => ({
      key: `menu-${menu.id}`,
      id: menu.id,
      isMenu: true,
      isFolder: Boolean(menu.menu_items && menu.menu_items.length > 0),
      name: menu.name,
      title: menu.name,
      location: menu.location,
      is_active: menu.is_active,
      created_at: menu.created_at,
      itemCount: menu._count?.menu_items || 0,
      children: menu.menu_items && menu.menu_items.length > 0 
        ? transformMenuItemsToTableData(menu.menu_items, menu.id)
        : undefined
    }))
  }

  const transformMenuItemsToTableData = (items: MenuItem[], menuId: number): TableRecord[] => {
    return items.map(item => ({
      key: `item-${item.id}`,
      id: item.id,
      menuId: menuId,
      isMenu: false,
      isFolder: Boolean(item.children && item.children.length > 0),
      title: item.title,
      url: item.url,
      target: item.target,
      order: item.order,
      is_active: item.is_active,
      parent_id: item.parent_id,
      children: item.children && item.children.length > 0 
        ? transformMenuItemsToTableData(item.children, menuId) 
        : undefined
    }))
  }

  const showCreateItemModal = (parent?: MenuItem) => {
    setParentItem(parent || null)
    itemForm.resetFields()
    itemForm.setFieldsValue({
      target: '_self',
      order: 0,
      is_active: true
    })
    setCreateItemModalVisible(true)
  }

  const showEditItemModal = (item: MenuItem) => {
    setEditingItem(item)
    itemForm.setFieldsValue({
      title: item.title,
      url: item.url || '',
      target: item.target,
      order: item.order,
      is_active: item.is_active
    })
    setEditItemModalVisible(true)
  }

  const handleCreateItem = async (values: {
    title: string
    url?: string
    target: string
    order: number
    is_active: boolean
  }) => {
    if (!selectedMenu) return

    try {
      setItemLoading(true)
      
      const payload = {
        ...values,
        menu_id: selectedMenu.id,
        parent_id: parentItem?.id || null,
      }
      
      console.log('💫 Enviando dados para API:', payload)
      
      const response = await fetch('/api/pg/menu-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      console.log('📡 Resposta da API:', response.status, response.statusText)

      if (response.ok) {
        messageApi.success('Item do menu criado com sucesso!')
        setCreateItemModalVisible(false)
        setParentItem(null)
        itemForm.resetFields()
        await fetchMenus()
      } else {
        const errorData = await response.json()
        console.log('❌ Erro da API:', errorData)
        throw new Error(errorData.message || 'Erro ao criar item do menu')
      }
    } catch (error) {
      console.error('❌ Erro ao criar item do menu:', error)
      messageApi.error(error instanceof Error ? error.message : 'Erro ao criar item do menu')
    } finally {
      setItemLoading(false)
    }
  }

  const handleEditItem = async (values: {
    title: string
    url?: string
    target: string
    order: number
    is_active: boolean
  }) => {
    if (!editingItem) return

    try {
      setItemLoading(true)
      
      console.log('✏️ Editando item:', editingItem.id, values)
      
      const response = await fetch(`/api/pg/menu-items/${editingItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      console.log('📡 Resposta da edição:', response.status, response.statusText)

      if (response.ok) {
        messageApi.success('Item do menu atualizado com sucesso!')
        setEditItemModalVisible(false)
        setEditingItem(null)
        itemForm.resetFields()
        await fetchMenus()
      } else {
        const errorData = await response.json()
        console.log('❌ Erro na edição:', errorData)
        throw new Error(errorData.message || 'Erro ao atualizar item do menu')
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar item do menu:', error)
      messageApi.error(error instanceof Error ? error.message : 'Erro ao atualizar item do menu')
    } finally {
      setItemLoading(false)
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    try {
      const response = await fetch(`/api/pg/menu-items/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        messageApi.success('Item do menu excluído com sucesso')
        await fetchMenus()
      } else {
        throw new Error('Erro ao excluir item do menu')
      }
    } catch (error) {
      console.error('❌ Erro ao excluir item do menu:', error)
      messageApi.error('Erro ao excluir item do menu')
    }
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
      title: 'Nome/Título',
      key: 'name',
      width: 300,
      render: (_: string, record: TableRecord) => (
        <Space>
          {record.isMenu ? (
            <>
              <MenuOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
              <Text strong style={{ color: '#1890ff' }}>{record.name}</Text>
              {(record.itemCount || 0) > 0 && (
                <Badge count={record.itemCount || 0} size="small" />
              )}
            </>
          ) : (
            <>
              {record.isFolder ? (
                <FolderOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
              ) : (
                <FileOutlined style={{ color: '#666', fontSize: '14px' }} />
              )}
              <Text>{record.title}</Text>
            </>
          )}
        </Space>
      ),
    },
    {
      title: 'Localização/URL',
      key: 'location_url',
      width: 200,
      render: (_: string, record: TableRecord) => {
        if (record.isMenu) {
          return (
            <Tag color="blue">
              {getLocationLabel(record.location || '')}
            </Tag>
          )
        } else {
          return (
            <Space>
              <LinkOutlined style={{ color: '#52c41a' }} />
              <Text 
                code 
                style={{ 
                  maxWidth: '120px', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  display: 'inline-block'
                }}
              >
                {record.url || '-'}
              </Text>
            </Space>
          )
        }
      },
    },
    {
      title: 'Tipo/Abrir em',
      key: 'type_target',
      width: 120,
      render: (_: string, record: TableRecord) => {
        if (record.isMenu) {
          return (
            <Tag color="purple">
              Menu
            </Tag>
          )
        } else {
          return (
            <Tag color="green" style={{ fontSize: '11px' }}>
              {getTargetLabel(record.target || '_self')}
            </Tag>
          )
        }
      },
    },
    {
      title: 'Ordem',
      key: 'order',
      width: 80,
      render: (_: string, record: TableRecord) => {
        if (record.isMenu) {
          return <Text type="secondary">-</Text>
        } else {
          return <Text>{record.order || 0}</Text>
        }
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 80,
      render: (_: string, record: TableRecord) => (
        <Switch
          checked={record.is_active}
          size="small"
          disabled
        />
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_: string, record: TableRecord) => {
        if (record.isMenu) {
          return (
            <Space>
              <Tooltip title="Adicionar Item">
                <PlusOutlined
                  style={{ fontSize: '14px', cursor: 'pointer', color: '#1890ff' }}
                  onClick={() => {
                    setSelectedMenu({
                      id: record.id,
                      name: record.name || '',
                      location: record.location || '',
                      is_active: record.is_active,
                      created_at: record.created_at || '',
                      updated_at: ''
                    } as Menu)
                    showCreateItemModal()
                  }}
                />
              </Tooltip>
              <Tooltip title="Editar Menu">
                <EditOutlined
                  style={{ fontSize: '14px', cursor: 'pointer' }}
                  onClick={() => router.push(`/adm/menus/${record.id}/edit`)}
                />
              </Tooltip>
              <Popconfirm
                title="Excluir menu?"
                onConfirm={() => {
                  setMenuToDelete({
                    id: record.id,
                    name: record.name || '',
                    location: record.location || '',
                    is_active: record.is_active,
                    created_at: record.created_at || '',
                    updated_at: ''
                  } as Menu)
                  handleDeleteMenu()
                }}
                okText="Sim"
                cancelText="Não"
              >
                <DeleteOutlined 
                  style={{ 
                    fontSize: '14px', 
                    cursor: 'pointer', 
                    color: '#ff4d4f' 
                  }} 
                />
              </Popconfirm>
            </Space>
          )
        } else {
          return (
            <Space>
              <Tooltip title="Editar">
                <EditOutlined
                  style={{ fontSize: '14px', cursor: 'pointer' }}
                  onClick={() => showEditItemModal({
                    id: record.id,
                    title: record.title || '',
                    url: record.url,
                    target: record.target || '_self',
                    order: record.order || 0,
                    is_active: record.is_active,
                    parent_id: record.parent_id || null,
                    children: []
                  } as MenuItem)}
                />
              </Tooltip>
              <Tooltip title="Adicionar Subitem">
                <PlusOutlined
                  style={{ fontSize: '14px', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedMenu({ id: record.menuId || 0 } as Menu)
                    showCreateItemModal({
                      id: record.id,
                      title: record.title || '',
                      url: record.url,
                      target: record.target || '_self',
                      order: record.order || 0,
                      is_active: record.is_active,
                      parent_id: record.parent_id || null,
                      children: []
                    } as MenuItem)
                  }}
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
                    fontSize: '14px', 
                    cursor: 'pointer', 
                    color: '#ff4d4f' 
                  }} 
                />
              </Popconfirm>
            </Space>
          )
        }
      },
    },
  ]

  return (
    <AdminLayout>
      {contextHolder}
      <Head>
        <title>Gerenciar Menus - Admin</title>
      </Head>

      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              Gerenciar Menus
            </Title>
            <Text type="secondary">
              Gerencie os menus do site
            </Text>
          </div>
          <Link href="/adm/menus/create">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              Novo Menu
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <Card style={{ marginBottom: '24px' }}>
          <Space size="middle">
            <Input
              placeholder="Buscar menus..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              placeholder="Todas as localizações"
              value={selectedLocation}
              onChange={handleLocationChange}
              style={{ width: 200 }}
              allowClear
            >
              <Option value="header">Cabeçalho</Option>
              <Option value="footer">Rodapé</Option>
              <Option value="sidebar">Barra Lateral</Option>
            </Select>
          </Space>
        </Card>

        {/* Lista de Menus e Itens */}
        <Card>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
            </div>
          ) : menus.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Nenhum menu encontrado.
              </Text>
              {searchTerm && (
                <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
                  Tente uma busca diferente ou remova os filtros.
                </Text>
              )}
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={transformMenusToTableData(menus)}
              rowKey="key"
              pagination={false}
              expandable={{ 
                defaultExpandAllRows: true,
                indentSize: 24
              }}
              size="middle"
              scroll={{ x: 1000 }}
            />
          )}
        </Card>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        title="Excluir Menu"
        open={deleteModalVisible}
        onOk={handleDeleteMenu}
        onCancel={() => {
          setDeleteModalVisible(false)
          setMenuToDelete(null)
        }}
        okText="Excluir"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
      >
        <p>
          Tem certeza que deseja excluir o menu &quot;{menuToDelete?.name}&quot;? 
          Esta ação não pode ser desfeita.
        </p>
      </Modal>



      {/* Modal de Criação de Item */}
      <Modal
        title={parentItem ? `Novo Subitem de: ${parentItem.title}` : "Novo Item do Menu"}
        open={createItemModalVisible}
        onCancel={() => {
          setCreateItemModalVisible(false)
          setParentItem(null)
          itemForm.resetFields()
        }}
        footer={null}
        width={500}
      >
        <Form
          form={itemForm}
          layout="vertical"
          onFinish={handleCreateItem}
        >
          <Form.Item
            label="Título"
            name="title"
            rules={[
              { required: true, message: 'Por favor, insira o título' },
              { min: 2, message: 'O título deve ter pelo menos 2 caracteres' }
            ]}
          >
            <Input placeholder="Ex: Página Inicial" />
          </Form.Item>

          <Form.Item
            label="URL"
            name="url"
          >
            <Input placeholder="Ex: /, /blog, https://exemplo.com" />
          </Form.Item>

          <Form.Item
            label="Abrir em"
            name="target"
          >
            <Select>
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
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label="Status"
            name="is_active"
          >
            <Select>
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
                loading={itemLoading}
              >
                {parentItem ? 'Criar Subitem' : 'Criar Item'}
              </Button>
              <Button
                onClick={() => {
                  setCreateItemModalVisible(false)
                  setParentItem(null)
                  itemForm.resetFields()
                }}
              >
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Edição de Item */}
      <Modal
        title="Editar Item do Menu"
        open={editItemModalVisible}
        onCancel={() => {
          setEditItemModalVisible(false)
          setEditingItem(null)
          itemForm.resetFields()
        }}
        footer={null}
        width={500}
      >
        <Form
          form={itemForm}
          layout="vertical"
          onFinish={handleEditItem}
        >
          <Form.Item
            label="Título"
            name="title"
            rules={[
              { required: true, message: 'Por favor, insira o título' },
              { min: 2, message: 'O título deve ter pelo menos 2 caracteres' }
            ]}
          >
            <Input placeholder="Ex: Página Inicial" />
          </Form.Item>

          <Form.Item
            label="URL"
            name="url"
          >
            <Input placeholder="Ex: /, /blog, https://exemplo.com" />
          </Form.Item>

          <Form.Item
            label="Abrir em"
            name="target"
          >
            <Select>
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
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label="Status"
            name="is_active"
          >
            <Select>
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
                icon={<EditOutlined />}
                loading={itemLoading}
              >
                Salvar Alterações
              </Button>
              <Button
                onClick={() => {
                  setEditItemModalVisible(false)
                  setEditingItem(null)
                  itemForm.resetFields()
                }}
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

