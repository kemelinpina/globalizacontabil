import React, { useState, useEffect, useCallback } from 'react'
import {
  Button,
  Table,
  Tag,
  Space,
  message,
  Popconfirm,
  Input,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
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
  updated_at: string
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const router = useRouter()

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch('/api/pg/posts')
      const data = await response.json()
      setPosts(data.posts || [])
      setFilteredPosts(data.posts || [])
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

  // Efeito para filtrar posts quando há busca
  useEffect(() => {
    if (searchText) {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchText.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchText.toLowerCase()) ||
        post.category.name.toLowerCase().includes(searchText.toLowerCase()) ||
        getStatusText(post.status).toLowerCase().includes(searchText.toLowerCase())
      )
      setFilteredPosts(filtered)
    } else {
      setFilteredPosts(posts)
    }
  }, [posts, searchText])

  const handleSearch = (value: string) => {
    setSearchText(value)
  }

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
      filters: Array.from(new Set(posts.map(post => post.category.name))).map(categoryName => ({
        text: categoryName,
        value: categoryName,
      })),
      onFilter: (value: unknown, record: Post) => record.category.name === value,
      filterSearch: true,
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
      filters: [
        { text: 'Publicado', value: 'published' },
        { text: 'Rascunho', value: 'draft' },
        { text: 'Arquivado', value: 'archived' },
      ],
      onFilter: (value: unknown, record: Post) => record.status === value,
    },
    {
      title: 'Criado em',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
      sorter: (a: Post, b: Post) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      sortDirections: ['descend' as const, 'ascend' as const],
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Atualizado em',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
      sorter: (a: Post, b: Post) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
      sortDirections: ['descend' as const, 'ascend' as const],
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
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Input
                placeholder="Buscar posts..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: '300px' }}
                allowClear
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => router.push('/adm/posts/create')}
              >
                Novo Post
              </Button>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '24px',
          }}>
            <Table
              columns={columns}
              dataSource={filteredPosts}
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