import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Space,
  Button,
  Input,
  Select,
  DatePicker,
  Tag,
  Typography,
  Row,
  Col,
  Modal,
  Tooltip,
  Badge,
  Divider,
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  FilterOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import axios from 'axios'
import AdminLayout from '../../components/AdminLayout'

const { Title, Text, Paragraph } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

interface LogRecord {
  id: number
  user_id?: number
  action: string
  action_display: string
  table_name: string
  table_display: string
  record_id?: number
  record_name?: string
  old_data?: any
  new_data?: any
  ip_address?: string
  user_agent?: string
  description?: string
  created_at: string
  created_at_formatted: string
  user?: {
    id: number
    name: string
    email: string
  }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    action: '',
    tableName: '',
    userId: '',
    dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null
  })
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null)

  // Opções para filtros
  const actionOptions = [
    { value: 'CREATE', label: 'Criou', color: 'green' },
    { value: 'UPDATE', label: 'Editou', color: 'blue' },
    { value: 'DELETE', label: 'Excluiu', color: 'red' },
    { value: 'LOGIN', label: 'Login', color: 'cyan' },
    { value: 'LOGOUT', label: 'Logout', color: 'gray' },
    { value: 'VIEW', label: 'Visualizou', color: 'purple' },
  ]

  const tableOptions = [
    { value: 'posts', label: 'Posts' },
    { value: 'categories', label: 'Categorias' },
    { value: 'users', label: 'Usuários' },
    { value: 'pages', label: 'Páginas' },
    { value: 'files', label: 'Arquivos' },
    { value: 'menus', label: 'Menus' },
    { value: 'menu_items', label: 'Itens do Menu' },
    { value: 'contacts', label: 'Contatos' },
    { value: 'home_about', label: 'Sobre (Home)' },
    { value: 'banner_whatsapp', label: 'Banner WhatsApp' },
  ]

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (search) params.append('search', search)
      if (filters.action) params.append('action', filters.action)
      if (filters.tableName) params.append('table_name', filters.tableName)
      if (filters.userId) params.append('user_id', filters.userId)
      if (filters.dateRange) {
        params.append('start_date', filters.dateRange[0].format('YYYY-MM-DD'))
        params.append('end_date', filters.dateRange[1].format('YYYY-MM-DD'))
      }

      const response = await axios.get(`/api/pg/logs?${params.toString()}`)
      setLogs(response.data.logs)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [pagination.page, pagination.limit])

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchLogs()
  }

  const handleReset = () => {
    setSearch('')
    setFilters({
      action: '',
      tableName: '',
      userId: '',
      dateRange: null
    })
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchLogs()
  }

  const showDetail = (log: LogRecord) => {
    setSelectedLog(log)
    setDetailModalVisible(true)
  }

  const getActionColor = (action: string) => {
    const option = actionOptions.find(opt => opt.value === action)
    return option?.color || 'default'
  }

  const columns: ColumnsType<LogRecord> = [
    {
      title: 'Data/Hora',
      dataIndex: 'created_at_formatted',
      key: 'created_at',
      width: 150,
      sorter: true,
      render: (text: string) => (
        <Text code style={{ fontSize: '11px' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Usuário',
      key: 'user',
      width: 120,
      render: (_, record) => {
        if (!record.user) {
          return <Text type="secondary">Sistema</Text>
        }
        return (
          <Tooltip title={record.user.email}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserOutlined style={{ fontSize: '12px', color: '#1890ff' }} />
              <Text style={{ fontSize: '12px' }} ellipsis>
                {record.user.name}
              </Text>
            </div>
          </Tooltip>
        )
      },
    },
    {
      title: 'Ação',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action: string, record) => (
        <Tag color={getActionColor(action)} style={{ fontSize: '11px' }}>
          {record.action_display}
        </Tag>
      ),
    },
    {
      title: 'Tabela',
      dataIndex: 'table_display',
      key: 'table_name',
      width: 120,
      render: (text: string) => (
        <Badge
          status="processing"
          text={<Text style={{ fontSize: '12px' }}>{text}</Text>}
        />
      ),
    },
    {
      title: 'Registro',
      key: 'record',
      width: 200,
      render: (_, record) => {
        if (!record.record_name) {
          return <Text type="secondary">-</Text>
        }
        return (
          <Text ellipsis style={{ fontSize: '12px' }}>
            {record.record_name}
          </Text>
        )
      },
    },
    {
      title: 'IP',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 120,
      render: (ip: string) => (
        <Text code style={{ fontSize: '11px' }}>
          {ip || '-'}
        </Text>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver detalhes">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => showDetail(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <AdminLayout>
      <div style={{ padding: '0' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarOutlined style={{ color: '#1890ff' }} />
            Logs do Sistema
          </Title>
          <Text type="secondary">
            Histórico de todas as ações realizadas no sistema
          </Text>
        </div>

        <Card>
          {/* Filtros */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={handleSearch}
                suffix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Ação"
                value={filters.action}
                onChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
                allowClear
                style={{ width: '100%' }}
              >
                {actionOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    <Tag color={option.color} style={{ marginRight: 4 }}>
                      {option.label}
                    </Tag>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Tabela"
                value={filters.tableName}
                onChange={(value) => setFilters(prev => ({ ...prev, tableName: value }))}
                allowClear
                style={{ width: '100%' }}
              >
                {tableOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                value={filters.dateRange}
                onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                >
                  Buscar
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                >
                  Limpar
                </Button>
              </Space>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={logs}
            rowKey="id"
            loading={loading}
            size="small"
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} de ${total} registros`,
              onChange: (page, pageSize) => {
                setPagination(prev => ({
                  ...prev,
                  page,
                  limit: pageSize || prev.limit
                }))
              },
            }}
            scroll={{ x: 1000 }}
          />
        </Card>

        {/* Modal de Detalhes */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <EyeOutlined />
              Detalhes do Log
            </div>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Fechar
            </Button>
          ]}
          width={800}
        >
          {selectedLog && (
            <div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Data/Hora:</Text>
                  <br />
                  <Text code>{selectedLog.created_at_formatted}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Usuário:</Text>
                  <br />
                  <Text>{selectedLog.user?.name || 'Sistema'}</Text>
                  {selectedLog.user?.email && (
                    <>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {selectedLog.user.email}
                      </Text>
                    </>
                  )}
                </Col>
                <Col span={12}>
                  <Text strong>Ação:</Text>
                  <br />
                  <Tag color={getActionColor(selectedLog.action)}>
                    {selectedLog.action_display}
                  </Tag>
                </Col>
                <Col span={12}>
                  <Text strong>Tabela:</Text>
                  <br />
                  <Text>{selectedLog.table_display}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>IP:</Text>
                  <br />
                  <Text code>{selectedLog.ip_address || '-'}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Registro:</Text>
                  <br />
                  <Text>{selectedLog.record_name || '-'}</Text>
                </Col>
              </Row>

              {selectedLog.description && (
                <>
                  <Divider />
                  <Text strong>Descrição:</Text>
                  <br />
                  <Text>{selectedLog.description}</Text>
                </>
              )}

              {selectedLog.user_agent && (
                <>
                  <Divider />
                  <Text strong>User Agent:</Text>
                  <br />
                  <Text code style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                    {selectedLog.user_agent}
                  </Text>
                </>
              )}

              {(selectedLog.old_data || selectedLog.new_data) && (
                <>
                  <Divider />
                  <Row gutter={[16, 16]}>
                    {selectedLog.old_data && (
                      <Col span={12}>
                        <Text strong>Dados Anteriores:</Text>
                        <pre style={{
                          background: '#f5f5f5',
                          padding: '12px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          maxHeight: '200px',
                          overflow: 'auto'
                        }}>
                          {JSON.stringify(selectedLog.old_data, null, 2)}
                        </pre>
                      </Col>
                    )}
                    {selectedLog.new_data && (
                      <Col span={12}>
                        <Text strong>Dados Novos:</Text>
                        <pre style={{
                          background: '#f5f5f5',
                          padding: '12px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          maxHeight: '200px',
                          overflow: 'auto'
                        }}>
                          {JSON.stringify(selectedLog.new_data, null, 2)}
                        </pre>
                      </Col>
                    )}
                  </Row>
                </>
              )}
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  )
}
