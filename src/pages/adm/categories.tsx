import React, { useState, useEffect, useCallback } from 'react'
import { Box, Heading } from '@chakra-ui/react'
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Tag,
  Table,
  Switch,
  ColorPicker,
  Upload,
  Image,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/AdminLayout'

import Head from 'next/head'

interface Category {
  id: number
  name: string
  color: string
  icon?: string
  is_active: boolean
  created_at: string
  updated_at: string
  _count: {
    posts: number
  }
}

interface FormValues {
  name: string
  color: string
  icon?: string
  is_active: boolean
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [searchText, setSearchText] = useState('')
  const [iconUploading, setIconUploading] = useState(false)
  const [form] = Form.useForm()
  const router = useRouter()

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/pg/categories')
      const data = await response.json()
      setCategories(data.categories || [])
      setFilteredCategories(data.categories || [])
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      message.error('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Efeito para filtrar categorias quando há busca
  useEffect(() => {
    if (searchText) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchText.toLowerCase())
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [categories, searchText])

  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  const handleCreate = () => {
    setEditingCategory(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    form.setFieldsValue({
      name: category.name,
      color: category.color,
      icon: category.icon,
      is_active: category.is_active,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/pg/categories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        message.success('Categoria excluída com sucesso')
        fetchCategories()
      } else {
        const data = await response.json()
        message.error(data.message || 'Erro ao excluir categoria')
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      message.error('Erro ao excluir categoria')
    }
  }

  const handleIconUpload = async (file: File) => {
    setIconUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('files', file)

      const response = await fetch('/api/arquivos/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Erro no upload: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        const iconUrl = result.files[0].url
        form.setFieldsValue({ icon: iconUrl })
        message.success('Ícone carregado com sucesso')
      } else {
        throw new Error(result.error || 'Erro desconhecido no upload')
      }

    } catch (error) {
      console.error('Erro no upload do ícone:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      message.error(`Erro no upload: ${errorMessage}`)
    } finally {
      setIconUploading(false)
    }
  }

  const iconUploadProps = {
    name: 'icon',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file: File) => {
      // Validação de tipo
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('Você só pode fazer upload de arquivos de imagem!')
        return false
      }
      
      // Validação de tamanho (5MB para ícones)
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        message.error('Ícone deve ter menos de 5MB!')
        return false
      }
      
      // Upload customizado
      handleIconUpload(file)
      return false // Previne upload automático
    },
  }

  const handleSubmit = async (values: FormValues) => {
    try {
      // Processar o valor da cor
      let colorValue = values.color
      if (typeof colorValue === 'object' && colorValue && 'toHexString' in colorValue) {
        colorValue = (colorValue as { toHexString: () => string }).toHexString()
      }

      const submitData = {
        ...values,
        color: colorValue
      }

      const url = editingCategory 
        ? `/api/pg/categories/${editingCategory.id}`
        : '/api/pg/create-category'
      
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (response.ok) {
        message.success(
          editingCategory 
            ? 'Categoria atualizada com sucesso'
            : 'Categoria criada com sucesso'
        )
        setModalVisible(false)
        fetchCategories()
      } else {
        message.error(data.message || 'Erro ao salvar categoria')
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      message.error('Erro ao salvar categoria')
    }
  }

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Category) => (
        <Space>
          <Tag color={record.color} style={{ 
            color: record.color === '#013F71' ? 'white' : 'inherit',
            fontWeight: 500 
          }}>
            {text}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Cor',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: color,
            borderRadius: '4px',
            border: '1px solid #d9d9d9'
          }} />
          <span>{color}</span>
        </div>
      ),
    },
    {
      title: 'Ícone',
      dataIndex: 'icon',
      key: 'icon',
      render: (icon: string) => icon ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          <img 
            src={icon} 
            alt="Ícone" 
            style={{ 
              width: '20px', 
              height: '20px',
              objectFit: 'contain'
            }} 
          />
          <span>{icon.split('/').pop()}</span>
        </div>
      ) : '-',
    },
    {
      title: 'Posts',
      dataIndex: '_count',
      key: 'posts',
      render: (count: { posts: number }) => (
        <Tag color="green">{count.posts} posts</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Ativa' : 'Inativa'}
        </Tag>
      ),
      filters: [
        { text: 'Ativa', value: true },
        { text: 'Inativa', value: false },
      ],
      onFilter: (value: unknown, record: Category) => record.is_active === value,
    },
    {
      title: 'Atualizado em',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
      sorter: (a: Category, b: Category) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
      sortDirections: ['descend' as const, 'ascend' as const],
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: Category) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => router.push(`/adm/categories/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Tem certeza que deseja excluir esta categoria?"
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
        <title>Categorias - Globaliza Contabil</title>
      </Head>

      <AdminLayout>
        <Box style={{ padding: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <Heading size="lg" style={{ margin: 0 }}>
              Categorias
            </Heading>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Input
                placeholder="Buscar categorias..."
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
                Nova Categoria
              </Button>
            </div>
          </div>

          <Box
            style={{
              background: 'white',
              borderRadius: '8px',
              padding: '24px',
            }}
          >
            <Table
              columns={columns}
              dataSource={filteredCategories}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} de ${total} categorias`,
              }}
            />
          </Box>
        </Box>

        <Modal
          title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              color: '#013F71',
              is_active: true,
            }}
          >
            <Form.Item
              name="name"
              label="Nome"
              rules={[{ required: true, message: 'Nome é obrigatório' }]}
            >
              <Input placeholder="Digite o nome da categoria" />
            </Form.Item>

            <Form.Item
              name="color"
              label="Cor do Badge"
            >
              <ColorPicker 
                defaultValue="#013F71"
                presets={[
                  {
                    label: 'Cores da Marca',
                    colors: [
                      '#013F71', // Primary
                      '#FA0A0A', // Accent
                      '#66CC33', // Success
                      '#0876D0', // Info
                    ],
                  },
                ]}
                format="hex"
              />
            </Form.Item>

            <Form.Item
              name="icon"
              label="Ícone da Categoria (opcional)"
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Upload {...iconUploadProps}>
                  <Button 
                    icon={<UploadOutlined />} 
                    loading={iconUploading}
                    type="primary"
                  >
                    {form.getFieldValue('icon') ? 'Alterar Ícone' : 'Carregar Ícone'}
                  </Button>
                </Upload>
                
                {form.getFieldValue('icon') && (
                  <>
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        form.setFieldsValue({ icon: undefined })
                      }}
                    >
                      Remover
                    </Button>
                    <Image
                      src={form.getFieldValue('icon')}
                      alt="Ícone atual"
                      width={50}
                      height={50}
                      style={{ objectFit: 'contain', borderRadius: '4px' }}
                    />
                  </>
                )}
              </div>
            </Form.Item>

            <Form.Item
              name="is_active"
              label="Ativa"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingCategory ? 'Atualizar' : 'Criar'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  Cancelar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </AdminLayout>
    </>
  )
} 