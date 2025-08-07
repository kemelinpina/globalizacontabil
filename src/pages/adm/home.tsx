import {
  Typography,
  Image,
  Card,
} from 'antd'
import AdminLayout from '../../components/AdminLayout'
import Head from 'next/head'
import { useAuth } from '../../contexts/AuthContext'

const { Title, Text } = Typography

export default function AdminHome() {
  const { user } = useAuth()

  return (
    <>
      <Head>
        <title>Painel Admin - Globaliza Contabil</title>
      </Head>
      
      <AdminLayout>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: 'calc(100vh - 200px)',
          textAlign: 'center',
          padding: '40px 20px'
        }}>
          {/* Imagem centralizada */}
          <Image
            src="/empty.svg"
            alt="Globaliza Contabil"
            width={300}
            height={300}
            style={{ 
              marginBottom: '32px',
              borderRadius: '12px',
              objectFit: 'cover',
              opacity: 0.75,
            }}
            preview={false}
          />
          
          {/* Título de boas-vindas */}
          <Title level={1} style={{ 
            marginBottom: '16px',
            color: '#013F71',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginTop: '32px'
          }}>
            Bem vindo! {user?.name}
          </Title>
          
          {/* Texto explicativo */}
          <Card 
            style={{ 
              maxWidth: '600px',
              textAlign: 'center',
              border: 'none',
              boxShadow: 'none',
              backgroundColor: 'transparent'
            }}
          >
            <Text style={{ 
              fontSize: '1.1rem',
              lineHeight: '1.6',
              color: '#666',
              display: 'block'
            }}>
              Este é o painel admin do site da Globaliza Contabil. 
              Aqui você vai poder gerenciar os principais pontos do site.
            </Text>
            
            <div style={{ marginTop: '24px' }}>
              <Text style={{ 
                fontSize: '1rem',
                color: '#999',
                fontStyle: 'italic'
              }}>
                Selecione uma opção no menu ao lado para começar.
              </Text>
            </div>
          </Card>
        </div>
      </AdminLayout>
    </>
  )
} 