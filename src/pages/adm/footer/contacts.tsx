import React, { useState, useEffect, useCallback } from 'react'
import {
  Button,
  Table,
  Space,
  message,
  Popconfirm,
  Input,
  Modal,
  Form,
  Select,
  Switch,
  ColorPicker,
  Tag,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import AdminLayout from '../../../components/AdminLayout'
import Head from 'next/head'
import { contactTypes, getContactTypeOptions, getContactIcon, getContactColor, formatContactLink, validateContactValue } from '../../../utils/contactTypes'

interface Contact {
  id: number
  location: string
  type: string
  title?: string
  link: string
  order: number
  custom_color?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface FormValues {
  type: string
  title?: string
  link: string
  order: number
  custom_color?: string
  is_active: boolean
}

export default function FooterContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()

  const fetchContacts = useCallback(async () => {
    try {
      const response = await fetch('/api/pg/contacts?location=footer')
      const data = await response.json()
      setContacts(data.contacts || [])
      setFilteredContacts(data.contacts || [])
    } catch (error) {
      console.error('Erro ao buscar contatos:', error)
      message.error('Erro ao carregar contatos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  // Efeito para filtrar contatos quando há busca
  useEffect(() => {
    if (searchText) {
      const filtered = contacts.filter(contact =>
        contact.type.toLowerCase().includes(searchText.toLowerCase()) ||
        (contact.title && contact.title.toLowerCase().includes(searchText.toLowerCase())) ||
        contact.link.toLowerCase().includes(searchText.toLowerCase())
      )
      setFilteredContacts(filtered)
    } else {
      setFilteredContacts(contacts)
    }
  }, [contacts, searchText])

  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  const handleCreate = () => {
    setEditingContact(null)
    form.resetFields()
    form.setFieldsValue({
      is_active: true,
      order: Math.max(...contacts.map(c => c.order), 0) + 1
    })
    setModalVisible(true)
  }

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    form.setFieldsValue({
      type: contact.type,
      title: contact.title,
      link: contact.link,
      order: contact.order,
      custom_color: contact.custom_color,
      is_active: contact.is_active,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/pg/contacts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        message.success('Contato excluído com sucesso')
        fetchContacts()
      } else {
        const data = await response.json()
        message.error(data.message || 'Erro ao excluir contato')
      }
    } catch (error) {
      console.error('Erro ao excluir contato:', error)
      message.error('Erro ao excluir contato')
    }
  }

  const handleSubmit = async (values: FormValues) => {
    try {
      // Validar valor do link conforme o tipo
      if (!validateContactValue(values.type, values.link)) {
        const config = contactTypes[values.type]
        message.error(`Formato inválido para ${config?.label || values.type}`)
        return
      }

      // Processar cor personalizada
      let colorValue = values.custom_color
      if (typeof colorValue === 'object' && colorValue && 'toHexString' in colorValue) {
        colorValue = (colorValue as { toHexString: () => string }).toHexString()
      }

      const submitData = {
        location: 'footer',
        type: values.type,
        title: values.title || null,
        link: formatContactLink(values.type, values.link),
        order: values.order,
        custom_color: colorValue || null,
        is_active: values.is_active
      }

      const url = editingContact 
        ? `/api/pg/contacts/${editingContact.id}`
        : '/api/pg/contacts'
      
      const method = editingContact ? 'PUT' : 'POST'

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
          editingContact 
            ? 'Contato atualizado com sucesso'
            : 'Contato criado com sucesso'
        )
        setModalVisible(false)
        fetchContacts()
      } else {
        message.error(data.message || 'Erro ao salvar contato')
      }
    } catch (error) {
      console.error('Erro ao salvar contato:', error)
      message.error('Erro ao salvar contato')
    }
  }

  const columns = [
    {
      title: 'Ordem',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      sorter: (a: Contact, b: Contact) => a.order - b.order,
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: string, record: Contact) => {
        const IconComponent = getContactIcon(type)
        const color = getContactColor(type, record.custom_color)
        const config = contactTypes[type]
        
        return (
          <Space>
            <span style={{ color, fontSize: '18px' }}>
              {React.createElement(IconComponent)}
            </span>
            <span>{config?.label || type}</span>
          </Space>
        )
      },
      filters: getContactTypeOptions().map(option => ({
        text: option.label,
        value: option.value,
      })),
      onFilter: (value: unknown, record: Contact) => record.type === value,
    },
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => title || '-',
    },
    {
      title: 'Link',
      dataIndex: 'link',
      key: 'link',
      render: (link: string) => (
        <Tooltip title={link}>
          <a href={link} target="_blank" rel="noopener noreferrer" style={{ maxWidth: '200px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {link}
          </a>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
      filters: [
        { text: 'Ativo', value: true },
        { text: 'Inativo', value: false },
      ],
      onFilter: (value: unknown, record: Contact) => record.is_active === value,
    },
    {
      title: 'Atualizado em',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
      sorter: (a: Contact, b: Contact) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
      sortDirections: ['descend' as const, 'ascend' as const],
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: Contact) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Excluir">
            <Popconfirm
              title="Tem certeza que deseja excluir este contato?"
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
        <title>Footer - Contatos - Globaliza Contabil</title>
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
              Footer - Contatos & Redes Sociais
            </h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Input
                placeholder="Buscar contatos..."
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
                Novo Contato
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
              dataSource={filteredContacts}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} de ${total} contatos`,
              }}
            />
          </div>
        </div>

        {/* Modal de Criação/Edição */}
        <Modal
          title={editingContact ? 'Editar Contato' : 'Novo Contato'}
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
              is_active: true,
            }}
          >
            <Form.Item
              name="type"
              label="Tipo de Contato"
              rules={[{ required: true, message: 'Tipo é obrigatório' }]}
            >
              <Select 
                placeholder="Selecione o tipo"
                options={getContactTypeOptions()}
                onChange={() => {
                  form.setFieldsValue({
                    link: ''
                  })
                }}
              />
            </Form.Item>

            <Form.Item
              name="title"
              label="Título (opcional)"
            >
              <Input placeholder="Título para exibição" />
            </Form.Item>

            <Form.Item
              name="link"
              label="Link/Valor"
              rules={[
                { required: true, message: 'Link é obrigatório' },
                {
                  validator: (_, value) => {
                    const type = form.getFieldValue('type')
                    if (type && value && !validateContactValue(type, value)) {
                      const config = contactTypes[type]
                      return Promise.reject(new Error(`Formato inválido para ${config?.label || type}. Use: ${config?.placeholder || 'formato válido'}`))
                    }
                    return Promise.resolve()
                  }
                }
              ]}
            >
              <Input 
                placeholder={
                  form.getFieldValue('type') 
                    ? contactTypes[form.getFieldValue('type')]?.placeholder || 'Digite o valor'
                    : 'Digite o valor'
                } 
              />
            </Form.Item>

            <Form.Item
              name="order"
              label="Ordem de Exibição"
              rules={[{ required: true, message: 'Ordem é obrigatória' }]}
            >
              <Input type="number" placeholder="1, 2, 3..." />
            </Form.Item>

            <Form.Item
              name="custom_color"
              label="Cor Personalizada (opcional)"
            >
              <ColorPicker 
                format="hex"
                presets={[
                  {
                    label: 'Cores Padrão',
                    colors: ['#66CC33', '#E82FA4', '#0077B5', '#1877F2', '#1DA1F2', '#FF0000'],
                  },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="is_active"
              label="Ativo"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingContact ? 'Atualizar' : 'Criar'}
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
