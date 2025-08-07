import React, { useState, useEffect } from 'react'
import {
  Button,
  Card,
  Typography,
  Avatar,
  Badge,
  Space,
  Spin,
  Table,
  Descriptions,
  message,
  Row,
  Col,
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  SafetyOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import Head from 'next/head'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
import { useRouter } from 'next/router'

const { Title, Text } = Typography

interface User {
  id: number
  name: string
  email: string
  super_adm: boolean
  is_active: boolean
  picture?: string
  created_at: string
  updated_at: string
  _count: {
    posts: number
  }
  posts: Array<{
    id: number
    title: string
    slug: string
    status: string
    created_at: string
    category: {
      name: string
    }
  }>
}

export default function UserDetails() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { id } = router.query
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    if (id) {
      fetchUser()
    }
  }, [id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/pg/users/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else if (response.status === 404) {
        messageApi.error('Usuário não encontrado')
        router.push('/adm/users')
      } else {
        throw new Error('Erro ao carregar usuário')
      }
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error)
      messageApi.error('Erro ao carregar dados do usuário')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const postColumns = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: User['posts'][0]) => (
        <Link href={`/adm/posts/${record.slug}`}>
          <Text style={{ color: '#1890ff', cursor: 'pointer' }}>
            {title}
          </Text>
        </Link>
      ),
    },
    {
      title: 'Categoria',
      key: 'category',
      render: (record: User['posts'][0]) => (
        <Badge
          color="red"
          text={record.category.name}
        />
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: User['posts'][0]) => (
        <Badge
          status={record.status === 'published' ? 'success' : 'warning'}
          text={record.status === 'published' ? 'Publicado' : 'Rascunho'}
        />
      ),
    },
    {
      title: 'Criado em',
      key: 'created_at',
      render: (record: User['posts'][0]) => <Text>{formatDate(record.created_at)}</Text>,
    },
  ]

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    )
  }

  if (!user) {
    return (
      <AdminLayout>
        <div style={{ padding: '24px' }}>
          <Text>Usuário não encontrado</Text>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      {contextHolder}
      <Head>
        <title>Detalhes do Usuário - Admin</title>
      </Head>

      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Link href="/adm/users">
              <Button
                icon={<ArrowLeftOutlined />}
                type="text"
                size="small"
                style={{ marginBottom: '8px' }}
              >
                Voltar
              </Button>
            </Link>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              Detalhes do Usuário
            </Title>
            <Text type="secondary">
              Informações completas sobre o usuário
            </Text>
          </div>
          <Link href={`/adm/users/${user.id}/edit`}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="large"
            >
              Editar Usuário
            </Button>
          </Link>
        </div>

        <Row gutter={[24, 24]}>
          {/* Informações Principais */}
          <Col xs={24} lg={16}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <Avatar
                  size={64}
                  src={user.picture}
                  style={{ marginRight: '16px' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    {user.name}
                  </Title>
                  <Text type="secondary">{user.email}</Text>
                </div>
              </div>

              <Space size="middle" style={{ marginBottom: '24px' }}>
                <Badge
                  status={user.is_active ? 'success' : 'error'}
                  text={user.is_active ? 'Ativo' : 'Inativo'}
                />
                <Badge
                  color={user.super_adm ? 'purple' : 'blue'}
                  text={user.super_adm ? 'Super Administrador' : 'Administrador'}
                />
              </Space>

              <Descriptions column={1} size="small">
                <Descriptions.Item
                  label={
                    <Space>
                      <UserOutlined />
                      <Text strong>Nome</Text>
                    </Space>
                  }
                >
                  {user.name}
                </Descriptions.Item>
                
                <Descriptions.Item
                  label={
                    <Space>
                      <MailOutlined />
                      <Text strong>Email</Text>
                    </Space>
                  }
                >
                  {user.email}
                </Descriptions.Item>
                
                <Descriptions.Item
                  label={
                    <Space>
                      <SafetyOutlined />
                      <Text strong>Tipo</Text>
                    </Space>
                  }
                >
                  {user.super_adm ? 'Super Administrador' : 'Administrador'}
                </Descriptions.Item>
                
                <Descriptions.Item
                  label={
                    <Space>
                      <CalendarOutlined />
                      <Text strong>Criado em</Text>
                    </Space>
                  }
                >
                  {formatDate(user.created_at)}
                </Descriptions.Item>
                
                <Descriptions.Item
                  label={
                    <Space>
                      <CalendarOutlined />
                      <Text strong>Última atualização</Text>
                    </Space>
                  }
                >
                  {formatDate(user.updated_at)}
                </Descriptions.Item>
                
                <Descriptions.Item
                  label={
                    <Space>
                      <FileTextOutlined />
                      <Text strong>Total de posts</Text>
                    </Space>
                  }
                >
                  {user._count.posts}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Posts Recentes */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <FileTextOutlined />
                  <Text strong>Posts Recentes</Text>
                </Space>
              }
              extra={
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Últimos 5 posts
                </Text>
              }
            >
              {user.posts.length > 0 ? (
                <Table
                  columns={postColumns}
                  dataSource={user.posts}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                  <Text type="secondary">
                    Este usuário ainda não criou nenhum post.
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  )
}
