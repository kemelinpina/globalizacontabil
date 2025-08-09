import React, { useState, useEffect } from 'react'
import {
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  List,
  Avatar,
  Badge,
  Tag,
  Space,
  Spin,
} from 'antd'
import {
  FileTextOutlined,
  FileProtectOutlined,
  FolderOutlined,
  UserOutlined,
  FileOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import AdminLayout from '../../components/AdminLayout'
import Head from 'next/head'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'

const { Title, Text } = Typography

interface DashboardStats {
  posts: {
    total: number
    published: number
    draft: number
    growth: string
  }
  pages: {
    total: number
    published: number
    draft: number
    growth: string
  }
  categories: {
    total: number
    active: number
    inactive: number
    growth: string
  }
  users: {
    total: number
    active: number
    inactive: number
    growth: string
  }
  files: {
    total: number
  }
  recent: {
    posts: Array<{
      id: number
      title: string
      status: string
      created_at: string
      author: { name: string }
    }>
    pages: Array<{
      id: number
      title: string
      status: string
      created_at: string
      author: { name: string }
    }>
  }
  popular: {
    posts: Array<{
      id: number
      title: string
      view_count: number
      slug: string
    }>
    pages: Array<{
      id: number
      title: string
      view_count: number
      slug: string
    }>
  }
}

export default function AdminHome() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/pg/dashboard-stats')
      setStats(response.data)
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'green'
      case 'draft': return 'orange'
      case 'archived': return 'red'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado'
      case 'draft': return 'Rascunho'
      case 'archived': return 'Arquivado'
      default: return status
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Dashboard - Globaliza Contabil</title>
      </Head>
      
      <AdminLayout>
        <div style={{ padding: '0' }}>
          {/* Cabeçalho */}
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0, color: '#013F71' }}>
              Dashboard
            </Title>
            <Text type="secondary">
              Bem-vindo, {user?.name}! Aqui está um resumo do seu site.
            </Text>
          </div>

          {/* Cards de Estatísticas Principais */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Posts"
                  value={stats?.posts.total || 0}
                  prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                  suffix={
                    <Space direction="vertical" size={0}>
                      <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                        {stats?.posts.published || 0} publicados
                      </Text>
                    </Space>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Páginas"
                  value={stats?.pages.total || 0}
                  prefix={<FileProtectOutlined style={{ color: '#722ed1' }} />}
                  suffix={
                    <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                      {stats?.pages.published || 0} publicadas
                    </Text>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Categorias"
                  value={stats?.categories.total || 0}
                  prefix={<FolderOutlined style={{ color: '#fa8c16' }} />}
                  suffix={
                    <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                      {stats?.categories.active || 0} ativas
                    </Text>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Usuários"
                  value={stats?.users.total || 0}
                  prefix={<UserOutlined style={{ color: '#f5222d' }} />}
                  suffix={
                    <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                      {stats?.users.active || 0} ativos
                    </Text>
                  }
                />
              </Card>
            </Col>
          </Row>

          {/* Cards de Detalhes */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={8}>
              <Card
                title={
                  <Space>
                    <FileOutlined />
                    Arquivos
                  </Space>
                }
                size="small"
              >
                <Statistic
                  value={stats?.files.total || 0}
                  suffix="arquivos"
                  valueStyle={{ fontSize: '24px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card
                title={
                  <Space>
                    <FileTextOutlined />
                    Status dos Posts
                  </Space>
                }
                size="small"
              >
                <Row gutter={8}>
                  <Col span={12}>
                    <Statistic
                      title="Publicados"
                      value={stats?.posts.published || 0}
                      valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Rascunhos"
                      value={stats?.posts.draft || 0}
                      valueStyle={{ color: '#fa8c16', fontSize: '18px' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card
                title={
                  <Space>
                    <FileProtectOutlined />
                    Status das Páginas
                  </Space>
                }
                size="small"
              >
                <Row gutter={8}>
                  <Col span={12}>
                    <Statistic
                      title="Publicadas"
                      value={stats?.pages.published || 0}
                      valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Rascunhos"
                      value={stats?.pages.draft || 0}
                      valueStyle={{ color: '#fa8c16', fontSize: '18px' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Listas de Conteúdo */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <ClockCircleOutlined />
                    Posts Recentes
                  </Space>
                }
                size="small"
              >
                <List
                  itemLayout="horizontal"
                  dataSource={stats?.recent.posts || []}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<FileTextOutlined />} />}
                        title={
                          <Space>
                            <Text ellipsis style={{ maxWidth: 200 }}>
                              {item.title}
                            </Text>
                            <Tag color={getStatusColor(item.status)} size="small">
                              {getStatusText(item.status)}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Por {item.author.name} • {new Date(item.created_at).toLocaleDateString('pt-BR')}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <ClockCircleOutlined />
                    Páginas Recentes
                  </Space>
                }
                size="small"
              >
                <List
                  itemLayout="horizontal"
                  dataSource={stats?.recent.pages || []}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<FileProtectOutlined />} />}
                        title={
                          <Space>
                            <Text ellipsis style={{ maxWidth: 200 }}>
                              {item.title}
                            </Text>
                            <Tag color={getStatusColor(item.status)} size="small">
                              {getStatusText(item.status)}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Por {item.author.name} • {new Date(item.created_at).toLocaleDateString('pt-BR')}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          {/* Conteúdo Mais Popular */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <TrophyOutlined />
                    Posts Mais Visualizados
                  </Space>
                }
                size="small"
              >
                <List
                  itemLayout="horizontal"
                  dataSource={stats?.popular.posts || []}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<EyeOutlined />} />}
                        title={
                          <Text ellipsis style={{ maxWidth: 250 }}>
                            {item.title}
                          </Text>
                        }
                        description={
                          <Space>
                            <Badge count={item.view_count} style={{ backgroundColor: '#52c41a' }} />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              visualizações
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <TrophyOutlined />
                    Páginas Mais Visualizadas
                  </Space>
                }
                size="small"
              >
                <List
                  itemLayout="horizontal"
                  dataSource={stats?.popular.pages || []}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<EyeOutlined />} />}
                        title={
                          <Text ellipsis style={{ maxWidth: 250 }}>
                            {item.title}
                          </Text>
                        }
                        description={
                          <Space>
                            <Badge count={item.view_count} style={{ backgroundColor: '#52c41a' }} />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              visualizações
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </AdminLayout>
    </>
  )
} 