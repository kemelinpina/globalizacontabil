import React, { useState, useEffect } from 'react'
import {
  Button,
  Input,
  Form,
  Card,
  Typography,
  Switch,
  Space,
  Alert,
  message,
  Row,
  Col,
  Spin,
} from 'antd'
import {
  SaveOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import Head from 'next/head'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
import { useRouter } from 'next/router'

const { Title, Text } = Typography
const { Password } = Input

interface User {
  id: number
  name: string
  email: string
  super_adm: boolean
  is_active: boolean
  picture?: string
  created_at: string
  updated_at: string
}

interface UserForm {
  name: string
  email: string
  password?: string
  confirmPassword?: string
  super_adm: boolean
  is_active: boolean
}

export default function EditUser() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fetchingUser, setFetchingUser] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [superAdm, setSuperAdm] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [changePassword, setChangePassword] = useState(false)
  
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
      setFetchingUser(true)
      const response = await fetch(`/api/pg/users/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setSuperAdm(data.user.super_adm)
        setIsActive(data.user.is_active)
        
        // Preencher formulário
        form.setFieldsValue({
          name: data.user.name,
          email: data.user.email,
        })
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
      setFetchingUser(false)
    }
  }

  const handleSubmit = async (values: UserForm) => {
    setLoading(true)

    try {
      const updateData: any = {
        name: values.name.trim(),
        email: values.email.trim(),
        super_adm: superAdm,
        is_active: isActive
      }

      // Só incluir senha se foi alterada
      if (changePassword && values.password) {
        updateData.password = values.password
      }

      const response = await fetch(`/api/pg/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (response.ok) {
        messageApi.success('Usuário atualizado com sucesso')
        router.push('/adm/users')
      } else {
        throw new Error(data.message || 'Erro ao atualizar usuário')
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error)
      messageApi.error(error instanceof Error ? error.message : 'Erro ao atualizar usuário')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingUser) {
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
        <title>Editar Usuário - Admin</title>
      </Head>

      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
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
            Editar Usuário
          </Title>
          <Text type="secondary">
            Atualize as informações do usuário
          </Text>
        </div>

        {/* Formulário */}
        <Card title="Informações do Usuário">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Nome completo"
                  name="name"
                  rules={[
                    { required: true, message: 'Nome é obrigatório' },
                    { min: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Digite o nome completo"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Email é obrigatório' },
                    { type: 'email', message: 'Email inválido' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Digite o email"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Alterar Senha */}
            <div style={{ marginBottom: '24px' }}>
              <Text strong style={{ display: 'block', marginBottom: '16px' }}>
                Alterar Senha
              </Text>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Form.Item>
                  <Switch
                    checked={changePassword}
                    onChange={setChangePassword}
                    checkedChildren="Sim"
                    unCheckedChildren="Não"
                  />
                  <Text type="secondary" style={{ marginLeft: '8px' }}>
                    Marque para alterar a senha
                  </Text>
                </Form.Item>

                {changePassword && (
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Nova senha"
                        name="password"
                        rules={[
                          { required: changePassword, message: 'Senha é obrigatória' },
                          { min: 6, message: 'Senha deve ter pelo menos 6 caracteres' }
                        ]}
                      >
                        <Password
                          prefix={<LockOutlined />}
                          placeholder="Digite a nova senha"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Confirmar nova senha"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                          { required: changePassword, message: 'Confirme a senha' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!changePassword || !value || getFieldValue('password') === value) {
                                return Promise.resolve()
                              }
                              return Promise.reject(new Error('Senhas não coincidem'))
                            },
                          }),
                        ]}
                      >
                        <Password
                          prefix={<LockOutlined />}
                          placeholder="Confirme a nova senha"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
              </Space>
            </div>

            {/* Configurações */}
            <div style={{ marginBottom: '24px' }}>
              <Text strong style={{ display: 'block', marginBottom: '16px' }}>
                Configurações
              </Text>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Form.Item label="Super Administrador">
                  <Switch
                    checked={superAdm}
                    onChange={setSuperAdm}
                    checkedChildren="Sim"
                    unCheckedChildren="Não"
                  />
                  <Text type="secondary" style={{ marginLeft: '8px' }}>
                    Super administradores têm acesso total ao sistema
                  </Text>
                </Form.Item>

                <Form.Item label="Usuário ativo">
                  <Switch
                    checked={isActive}
                    onChange={setIsActive}
                    checkedChildren="Sim"
                    unCheckedChildren="Não"
                  />
                  <Text type="secondary" style={{ marginLeft: '8px' }}>
                    Usuários inativos não podem fazer login
                  </Text>
                </Form.Item>
              </Space>
            </div>

            {/* Alertas */}
            {superAdm && (
              <Alert
                message="Atenção"
                description="Super administradores têm acesso total ao sistema, incluindo exclusão de outros usuários."
                type="warning"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}

            {!isActive && (
              <Alert
                message="Informação"
                description="Usuários inativos não podem fazer login no sistema."
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}

            {/* Botões */}
            <Form.Item>
              <Space>
                <Link href="/adm/users">
                  <Button size="large">
                    Cancelar
                  </Button>
                </Link>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  size="large"
                >
                  Salvar Alterações
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  )
}
