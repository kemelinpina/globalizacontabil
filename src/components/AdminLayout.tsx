import React, { useState, useEffect } from 'react'
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  theme,
  Modal,
  message,
} from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  FolderOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BarsOutlined,
  FileOutlined,
  ContactsOutlined,
  GlobalOutlined,
  WhatsAppOutlined,
  FileProtectOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { useAuth } from '../contexts/AuthContext'
import { CgMenuMotion } from 'react-icons/cg'

const { Header, Sider, Content } = Layout

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [messageApi, contextHolder] = message.useMessage()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  // Redirecionar para login se não estiver logado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/adm')
    }
  }, [user, loading, router])

  const menuItems = [
    {
      key: '/adm/home',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/adm/posts',
      icon: <FileTextOutlined />,
      label: 'Posts',
    },
    {
      key: '/adm/pages',
      icon: <FileProtectOutlined />,
      label: 'Páginas',
    },
    {
      key: '/adm/categories',
      icon: <FolderOutlined />,
      label: 'Categorias',
    },
    {
      key: '/adm/files',
      icon: <FileOutlined />,
      label: 'Arquivos',
    },
    {
      key: 'home-group',
      icon: <GlobalOutlined />,
      label: 'Home',
      children: [
        {
          key: '/adm/home/contacts',
          icon: <ContactsOutlined />,
          label: 'Contatos',
        },
        {
          key: '/adm/home/about',
          icon: <UserOutlined />,
          label: 'Sobre',
        },
        {
          key: '/adm/home/banner-whatsapp',
          icon: <WhatsAppOutlined />,
          label: 'Banner WhatsApp',
        },
      ],
    },
    {
      key: 'header-group',
      icon: <GlobalOutlined />,
      label: 'Header',
      children: [
        {
          key: '/adm/header/contacts',
          icon: <ContactsOutlined />,
          label: 'Contatos',
        },
      ],
    },
    {
      key: 'footer-group',
      icon: <GlobalOutlined />,
      label: 'Footer',
      children: [
        {
          key: '/adm/footer/contacts',
          icon: <ContactsOutlined />,
          label: 'Contatos',
        },
      ],
    },
    {
      key: '/adm/users',
      icon: <UserOutlined />,
      label: 'Usuários',
    },
    {
      key: '/adm/menus',
      icon: <BarsOutlined />,
      label: 'Menus',
    },
    {
      key: '/adm/settings',
      icon: <SettingOutlined />,
      label: 'Configurações',
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Perfil',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      setLogoutModalVisible(true)
    } else if (key.startsWith('/')) {
      router.push(key)
    }
  }

  const handleLogout = () => {
    logout()
    messageApi.success('Logout realizado com sucesso')
    router.push('/adm')
  }

  // Se está carregando, mostrar loading
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Carregando...
      </div>
    )
  }

  // Se não há usuário logado, não renderizar nada (será redirecionado)
  if (!user) {
    return null
  }

  return (
    <>
      {contextHolder}
      <Layout style={{ height: '100vh', overflow: 'hidden' }} className="admin-layout">
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            background: colorBgContainer,
            overflow: 'hidden',
            justifyContent: 'space-between',
          }}
        >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          flexShrink: 0,
        }}>
          {collapsed ? (
            <Image
              src="/icon.svg"
              alt="Globaliza Contabil"
              width={32}
              height={32}
              style={{ objectFit: 'contain' }}
            />
          ) : (
            <Image
              src="/logo-globaliza.svg"
              alt="Globaliza Contabil"
              width={140}
              height={40}
              style={{ objectFit: 'contain' }}
            />
          )}
        </div>

        <div style={{ 
          flex: 1, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Menu
            mode="inline"
            selectedKeys={[router.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              borderRight: 0,
              marginTop: 16,
              flex: 1,
              overflow: 'auto',
            }}
            inlineCollapsed={collapsed}
          />

          {/* User Section */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #f0f0f0',
            background: colorBgContainer,
            flexShrink: 0,
          }}>
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleMenuClick,
              }}
              placement="topRight"
              trigger={['click']}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                transition: 'background-color 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              >
                <Avatar
                  size={collapsed ? 32 : 40}
                  src={user.picture}
                  icon={<UserOutlined />}
                  style={{ marginRight: collapsed ? 0 : 12 }}
                />
                {!collapsed && (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#262626',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {user.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#8c8c8c',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {user.email}
                    </div>
                  </div>
                )}
              </div>
            </Dropdown>
          </div>
        </div>
      </Sider>

      <Layout style={{ overflow: 'hidden' }}>
        <Header
          style={{
            padding: 0,
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <CgMenuMotion style={{ transform: 'scaleX(-1)' }} /> : <CgMenuMotion style={{ color: '#66CC33' }} />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 40,
              height: 40,
              background: 'white',
              borderRadius: '4px',
              marginLeft: '16px',
            }}
          />
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
            minHeight: 'calc(100vh - 112px)', // altura mínima em vez de fixa
          }}
          className="admin-content"
        >
          {children}
        </Content>
      </Layout>
    </Layout>

    {/* Modal de Confirmação de Logout */}
    <Modal
      title="Confirmar Logout"
      open={logoutModalVisible}
      onOk={handleLogout}
      onCancel={() => setLogoutModalVisible(false)}
      okText="Sair"
      cancelText="Cancelar"
      okButtonProps={{ danger: true }}
    >
      <p>Tem certeza que deseja sair do sistema?</p>
    </Modal>
    </>
  )
} 