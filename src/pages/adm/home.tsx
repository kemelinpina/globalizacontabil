import {
  Row,
  Col,
  Card,
  Statistic,
  Button,
  Typography,
  Space
} from 'antd'
import {
  FileTextOutlined,
  FolderOutlined,
  UserOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import AdminLayout from '../../components/AdminLayout'
import Head from 'next/head'

const { Title, Text } = Typography

export default function AdminHome() {
  return (
    <>
      <Head>
        <title>Dashboard - Globaliza Contabil</title>
      </Head>
      
      <AdminLayout>
        <div>
          <Title level={2} style={{ marginBottom: 24 }}>
            Dashboard
          </Title>
          
          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total de Posts"
                  value={0}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Categorias"
                  value={0}
                  prefix={<FolderOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Usuários"
                  value={1}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Visualizações"
                  value={0}
                  prefix={<EyeOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Quick Actions and Recent Posts */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Ações Rápidas" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    size="large"
                    block
                  >
                    Criar Novo Post
                  </Button>
                  
                  <Button 
                    icon={<FolderOutlined />}
                    size="large"
                    block
                  >
                    Adicionar Categoria
                  </Button>
                  
                  <Button 
                    icon={<UserOutlined />}
                    size="large"
                    block
                  >
                    Gerenciar Usuários
                  </Button>
                </Space>
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card title="Posts Recentes" size="small">
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Text type="secondary">
                    Nenhum post criado ainda.
                  </Text>
                  <br />
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    style={{ marginTop: 16 }}
                  >
                    Criar Primeiro Post
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </AdminLayout>
    </>
  )
} 