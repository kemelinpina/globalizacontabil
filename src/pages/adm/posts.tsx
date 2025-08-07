import React, { useState, useEffect, useCallback } from 'react'
import {
  Button,
  Table,
  Tag,
  Space,
  message,
  Popconfirm,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/AdminLayout'
import Head from 'next/head'

interface Post {
  id: number
  title: string
  slug: string
  status: string
  author: {
    name: string
  }
  category: {
    name: string
  }
  created_at: string
  view_count: number
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch('/api/pg/posts')
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
      message.error('Erro ao carregar posts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'green'
      case 'draft':
        return 'orange'
      case 'archived':
        return 'red'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado'
      case 'draft':
        return 'Rascunho'
      case 'archived':
        return 'Arquivado'
      default:
        return status
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/pg/posts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        message.success('Post excluído com sucesso')
        fetchPosts()
      } else {
        const data = await response.json()
        message.error(data.message || 'Erro ao excluir post')
      }
    } catch (error) {
      console.error('Erro ao excluir post:', error)
      message.error('Erro ao excluir post')
    }
  }

  const columns = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <span style={{ fontWeight: 500 }}>{text}</span>
      ),
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      render: (category: { name: string }) => (
        <Tag color="blue">{category.name}</Tag>
      ),
    },
    {
      title: 'Autor',
      dataIndex: 'author',
      key: 'author',
      render: (author: { name: string }) => author.name,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Visualizações',
      dataIndex: 'view_count',
      key: 'view_count',
      render: (count: number) => count || 0,
    },
    {
      title: 'Criado em',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: Post) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => router.push(`/post/${record.slug}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => router.push(`/adm/posts/edit/${record.id}`)}
          />
          <Popconfirm
            title="Tem certeza que deseja excluir este post?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Head>
        <title>Posts - Globaliza Contabil</title>
      </Head>
      
      <AdminLayout>
        <div style={{ padding: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              margin: 0 
            }}>
              Posts
            </h1>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/adm/posts/create')}
            >
              Novo Post
            </Button>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '24px',
          }}>
            <Table
              columns={columns}
              dataSource={posts}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} de ${total} posts`,
              }}
            />
          </div>
        </div>
      </AdminLayout>
    </>
  )
} 