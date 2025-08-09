import React, { useState, useEffect, useCallback } from 'react'
import {
  Button,
  Table,
  Space,
  message,
  Popconfirm,
  Input,
  Tag,
  Tooltip,
  Dropdown,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import AdminLayout from '../../components/AdminLayout'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'

interface Page {
  id: number
  title: string
  slug: string
  excerpt?: string
  status: string
  template: string
  is_featured: boolean
  view_count: number
  published_at?: string
  created_at: string
  updated_at: string
  author: {
    id: number
    name: string
    email: string
  }
}

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [filteredPages, setFilteredPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  const fetchPages = useCallback(async () => {
    try {
      const response = await fetch('/api/pg/pages?limit=100')
      const data = await response.json()
      setPages(data.pages || [])
      setFilteredPages(data.pages || [])
    } catch (error) {
      console.error('Erro ao buscar páginas:', error)
      message.error('Erro ao carregar páginas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  // Efeito para filtrar páginas quando há busca
  useEffect(() => {
    if (searchText) {
      const filtered = pages.filter(page =>
        page.title.toLowerCase().includes(searchText.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchText.toLowerCase()) ||
        page.author.name.toLowerCase().includes(searchText.toLowerCase()) ||
        page.status.toLowerCase().includes(searchText.toLowerCase()) ||
        page.template.toLowerCase().includes(searchText.toLowerCase())
      )
      setFilteredPages(filtered)
    } else {
      setFilteredPages(pages)
    }
  }, [pages, searchText])

  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  const handleCreate = () => {
    router.push('/adm/pages/create')
  }

  const handleEdit = (id: number) => {
    router.push(`/adm/pages/edit/${id}`)
  }

  const handleView = (slug: string) => {
    window.open(`/page/${slug}`, '_blank')
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/pg/pages/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        message.success('Página excluída com sucesso')
        fetchPages()
      } else {
        const data = await response.json()
        message.error(data.message || 'Erro ao excluir página')
      }
    } catch (error) {
      console.error('Erro ao excluir página:', error)
      message.error('Erro ao excluir página')
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

  const getTemplateColor = (template: string) => {
    switch (template) {
      case 'default': return 'blue'
      case 'landing': return 'purple'
      case 'contact': return 'cyan'
      default: return 'default'
    }
  }

  // Opções de status únicas para filtro
  const statusOptions = [...new Set(pages.map(page => page.status))].map(status => ({
    text: getStatusText(status),
    value: status,
  }))

  // Opções de template únicas para filtro
  const templateOptions = [...new Set(pages.map(page => page.template))].map(template => ({
    text: template.charAt(0).toUpperCase() + template.slice(1),
    value: template,
  }))

  const columns = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Page) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {title}
            {record.is_featured && (
              <Tag color="gold" style={{ marginLeft: '8px' }}>Destaque</Tag>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            /page/{record.slug}
          </div>
        </div>
      ),
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
      filters: statusOptions,
      onFilter: (value: unknown, record: Page) => record.status === value,
    },
    {
      title: 'Template',
      dataIndex: 'template',
      key: 'template',
      render: (template: string) => (
        <Tag color={getTemplateColor(template)}>
          {template.charAt(0).toUpperCase() + template.slice(1)}
        </Tag>
      ),
      filters: templateOptions,
      onFilter: (value: unknown, record: Page) => record.template === value,
    },
    {
      title: 'Autor',
      dataIndex: 'author',
      key: 'author',
      render: (author: Page['author']) => author.name,
    },
    {
      title: 'Visualizações',
      dataIndex: 'view_count',
      key: 'view_count',
      sorter: (a: Page, b: Page) => a.view_count - b.view_count,
    },
    {
      title: 'Criado em',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
      sorter: (a: Page, b: Page) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      sortDirections: ['descend' as const, 'ascend' as const],
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Atualizado em',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
      sorter: (a: Page, b: Page) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
      sortDirections: ['descend' as const, 'ascend' as const],
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: Page) => (
        <Space>
          <Tooltip title="Visualizar">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleView(record.slug)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record.id)}
            />
          </Tooltip>
          <Tooltip title="Excluir">
            <Popconfirm
              title="Tem certeza que deseja excluir esta página?"
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
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Head>
        <title>Páginas - Globaliza Contabil</title>
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
              Páginas
            </h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Input
                placeholder="Buscar páginas..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: '300px' }}
                allowClear
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Nova Página
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
              dataSource={filteredPages}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} de ${total} páginas`,
              }}
            />
          </div>
        </div>
      </AdminLayout>
    </>
  )
}
