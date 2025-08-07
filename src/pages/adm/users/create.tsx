import React, { useState } from 'react'
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

interface UserForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  super_adm: boolean
  is_active: boolean
}

export default function CreateUser() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [superAdm, setSuperAdm] = useState(false)
  const [isActive, setIsActive] = useState(true)
  
  const router = useRouter()
  const [messageApi, contextHolder] = message.useMessage()

  const handleSubmit = async (values: UserForm) => {
    setLoading(true)

    try {
      const response = await fetch('/api/pg/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          super_adm: superAdm,
          is_active: isActive
        }),
      })

      const data = await response.json()

      if (response.ok) {
        messageApi.success('Usuário criado com sucesso')
        router.push('/adm/users')
      } else {
        throw new Error(data.message || 'Erro ao criar usuário')
      }
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error)
      messageApi.error(error instanceof Error ? error.message : 'Erro ao criar usuário')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      {contextHolder}
      <Head>
        <title>Criar Usuário - Admin</title>
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
            Criar Novo Usuário
          </Title>
          <Text type="secondary">
            Cadastre um novo usuário no sistema
          </Text>
        </div>

        {/* Formulário */}
        <Card title="Informações do Usuário">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              super_adm: false,
              is_active: true
            }}
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

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Senha"
                  name="password"
                  rules={[
                    { required: true, message: 'Senha é obrigatória' },
                    { min: 6, message: 'Senha deve ter pelo menos 6 caracteres' }
                  ]}
                >
                  <Password
                    prefix={<LockOutlined />}
                    placeholder="Digite a senha"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Confirmar senha"
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Confirme a senha' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve()
                        }
                        return Promise.reject(new Error('Senhas não coincidem'))
                      },
                    }),
                  ]}
                >
                  <Password
                    prefix={<LockOutlined />}
                    placeholder="Confirme a senha"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

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
                  Criar Usuário
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  )
}
