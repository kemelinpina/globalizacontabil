import React, { useState, useEffect, useCallback } from 'react'
import {
  Button,
  Table,
  Space,
  message,
  Popconfirm,
  Tag,
  Input,
  Tooltip,
  Upload,
} from 'antd'
import {
  DeleteOutlined,
  EyeOutlined,
  LinkOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons'

import AdminLayout from '../../components/AdminLayout'
import Head from 'next/head'

interface FileItem {
  id: number
  name: string
  url: string
  size?: number
  type?: string
  created_at: string
  updated_at: string
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [uploading, setUploading] = useState(false)

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch('/api/arquivos')
      const data = await response.json()
      setFiles(data.files || [])
      setFilteredFiles(data.files || [])
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error)
      message.error('Erro ao carregar arquivos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  // Efeito para reapliar busca quando os arquivos mudam
  useEffect(() => {
    if (searchText) {
      const filtered = files.filter(file =>
        file.name.toLowerCase().includes(searchText.toLowerCase()) ||
        getFileType(file.type).toLowerCase().includes(searchText.toLowerCase())
      )
      setFilteredFiles(filtered)
    } else {
      setFilteredFiles(files)
    }
  }, [files, searchText])

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/arquivos/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        message.success('Arquivo excluído com sucesso')
        fetchFiles()
      } else {
        const data = await response.json()
        message.error(data.message || 'Erro ao excluir arquivo')
      }
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error)
      message.error('Erro ao excluir arquivo')
    }
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    
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
        message.success('Arquivo enviado com sucesso')
        fetchFiles()
      } else {
        throw new Error(result.error || 'Erro desconhecido no upload')
      }

    } catch (error) {
      console.error('Erro no upload:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      message.error(`Erro no upload: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  const uploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file: File) => {
      // Validação de tamanho (100MB)
      const isLt100M = file.size / 1024 / 1024 < 100
      if (!isLt100M) {
        message.error('Arquivo deve ter menos de 100MB!')
        return false
      }
      
      // Upload customizado
      handleUpload(file)
      return false // Previne upload automático
    },
  }

  const handleCopyLink = async (url: string) => {
    try {
      // O URL já vem completo do servidor local, não precisa concatenar com origin
      await navigator.clipboard.writeText(url)
      message.success({
        content: 'Link copiado para a área de transferência!',
        duration: 3,
      })
    } catch (error) {
      console.error('Erro ao copiar link:', error)
      // Fallback para navegadores mais antigos
      try {
        const textArea = document.createElement('textarea')
        textArea.value = url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        message.success({
          content: 'Link copiado para a área de transferência!',
          duration: 3,
        })
      } catch {
        message.error('Erro ao copiar link. Tente novamente.')
      }
    }
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    const filtered = files.filter(file =>
      file.name.toLowerCase().includes(value.toLowerCase()) ||
      getFileType(file.type).toLowerCase().includes(value.toLowerCase())
    )
    setFilteredFiles(filtered)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileType = (type?: string) => {
    if (!type) return 'Desconhecido'
    if (type.startsWith('image/')) return 'Imagem'
    if (type.startsWith('video/')) return 'Vídeo'
    if (type.startsWith('audio/')) return 'Áudio'
    if (type.includes('pdf')) return 'PDF'
    if (type.includes('document') || type.includes('word')) return 'Documento'
    if (type.includes('spreadsheet') || type.includes('excel')) return 'Planilha'
    return 'Arquivo'
  }

  const getFileTypeColor = (type?: string) => {
    if (!type) return 'default'
    if (type.startsWith('image/')) return 'green'
    if (type.startsWith('video/')) return 'blue'
    if (type.startsWith('audio/')) return 'purple'
    if (type.includes('pdf')) return 'red'
    if (type.includes('document') || type.includes('word')) return 'orange'
    if (type.includes('spreadsheet') || type.includes('excel')) return 'cyan'
    return 'default'
  }

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span style={{ fontWeight: 500 }}>{text}</span>
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getFileTypeColor(type)}>
          {getFileType(type)}
        </Tag>
      ),
    },
    {
      title: 'Tamanho',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatFileSize(size),
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
      render: (record: FileItem) => (
        <Space>
          <Tooltip title="Abrir em nova aba">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => window.open(record.url, '_blank')}
            />
          </Tooltip>
          <Tooltip title="Copiar link do arquivo">
            <Button
              type="text"
              icon={<LinkOutlined />}
              size="small"
              onClick={() => handleCopyLink(record.url)}
            />
          </Tooltip>
          <Tooltip title="Excluir arquivo">
            <Popconfirm
              title="Tem certeza que deseja excluir este arquivo?"
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
        <title>Arquivos - Globaliza Contabil</title>
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
              Arquivos
            </h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Input
                placeholder="Buscar arquivos..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: '300px' }}
                allowClear
              />
              <Upload {...uploadProps}>
                <Button 
                  icon={<UploadOutlined />} 
                  loading={uploading}
                  type="primary"
                >
                  Enviar Arquivo
                </Button>
              </Upload>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '24px',
          }}>
            <Table
              columns={columns}
              dataSource={filteredFiles}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} de ${total} arquivos`,
              }}
            />
          </div>
        </div>
      </AdminLayout>
    </>
  )
}
