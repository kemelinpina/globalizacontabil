import React, { useState, useEffect, useCallback } from 'react'
import {
  Button,
  Input,
  Select,
  Table,
  Avatar,
  Badge,
  Space,
  Card,
  Typography,
  Spin,
  Modal,
  message,
  Dropdown,
  Menu,
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons'
import Head from 'next/head'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
import { useRouter } from 'next/router'

const { Title, Text } = Typography
const { Option } = Select

interface User {
  id: number
  name: string
  email: string
  super_adm: boolean
  is_active: boolean
  picture?: string
  created_at: string
  updated_at: string
  _count?: {
    posts: number
  }
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  
  const router = useRouter()
  const [messageApi, contextHolder] = message.useMessage()

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      if (selectedStatus) {
        params.append('is_active', selectedStatus)
      }

      const response = await fetch(`/api/pg/users?${params}`)
      const data = await response.json()

      setUsers(data.users || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error)
      messageApi.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, selectedStatus, messageApi])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
    setCurrentPage(1)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      const response = await fetch(`/api/pg/users/${userToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        messageApi.success('Usuário excluído com sucesso')
        fetchUsers()
      } else {
        throw new Error('Erro ao excluir usuário')
      }
    } catch (error) {
      console.error('❌ Erro ao excluir usuário:', error)
      messageApi.error('Erro ao excluir usuário')
    } finally {
      setDeleteModalVisible(false)
      setUserToDelete(null)
    }
  }

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/pg/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !currentStatus
        }),
      })

      if (response.ok) {
        messageApi.success(`Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`)
        fetchUsers()
      } else {
        throw new Error('Erro ao alterar status do usuário')
      }
    } catch (error) {
      console.error('❌ Erro ao alterar status do usuário:', error)
      messageApi.error('Erro ao alterar status do usuário')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const columns = [
    {
      title: 'Usuário',
      key: 'user',
      render: (record: User) => (
        <Space>
          <Avatar src={record.picture} size="small">
            {record.name.charAt(0).toUpperCase()}
          </Avatar>
          <Text strong>{record.name}</Text>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => <Text>{email}</Text>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: User) => (
        <Badge
          status={record.is_active ? 'success' : 'error'}
          text={record.is_active ? 'Ativo' : 'Inativo'}
        />
      ),
    },
    {
      title: 'Tipo',
      key: 'type',
      render: (record: User) => (
        <Badge
          color={record.super_adm ? 'purple' : 'blue'}
          text={record.super_adm ? 'Super Admin' : 'Admin'}
        />
      ),
    },
    {
      title: 'Posts',
      key: 'posts',
      render: (record: User) => <Text>{record._count?.posts || 0}</Text>,
    },
    {
      title: 'Criado em',
      key: 'created_at',
      render: (record: User) => <Text>{formatDate(record.created_at)}</Text>,
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: User) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="view"
                icon={<EyeOutlined />}
                onClick={() => router.push(`/adm/users/${record.id}`)}
              >
                Ver detalhes
              </Menu.Item>
              <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => router.push(`/adm/users/${record.id}/edit`)}
              >
                Editar
              </Menu.Item>
              <Menu.Item
                key="toggle"
                icon={record.is_active ? <UserDeleteOutlined /> : <UserAddOutlined />}
                onClick={() => handleToggleStatus(record.id, record.is_active)}
              >
                {record.is_active ? 'Desativar' : 'Ativar'}
              </Menu.Item>
              <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                danger
                onClick={() => {
                  setUserToDelete(record)
                  setDeleteModalVisible(true)
                }}
              >
                Excluir
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  return (
    <AdminLayout>
      {contextHolder}
      <Head>
        <title>Gerenciar Usuários - Admin</title>
      </Head>

      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              Gerenciar Usuários
            </Title>
            <Text type="secondary">
              Gerencie os usuários do sistema
            </Text>
          </div>
          <Link href="/adm/users/create">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              Novo Usuário
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <Card style={{ marginBottom: '24px' }}>
          <Space size="middle">
            <Input
              placeholder="Buscar usuários..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              placeholder="Todos os status"
              value={selectedStatus}
              onChange={handleStatusChange}
              style={{ width: 200 }}
              allowClear
            >
              <Option value="true">Ativos</Option>
              <Option value="false">Inativos</Option>
            </Select>
          </Space>
        </Card>

        {/* Lista de Usuários */}
        <Card>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Nenhum usuário encontrado.
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
              dataSource={users}
              rowKey="id"
              pagination={{
                current: currentPage,
                total: totalPages * 10,
                pageSize: 10,
                onChange: (page) => setCurrentPage(page),
                showSizeChanger: false,
                showQuickJumper: false,
              }}
            />
          )}
        </Card>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        title="Excluir Usuário"
        open={deleteModalVisible}
        onOk={handleDeleteUser}
        onCancel={() => {
          setDeleteModalVisible(false)
          setUserToDelete(null)
        }}
        okText="Excluir"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
      >
        <p>
          Tem certeza que deseja excluir o usuário &quot;{userToDelete?.name}&quot;? 
          Esta ação não pode ser desfeita.
        </p>
      </Modal>
    </AdminLayout>
  )
}
