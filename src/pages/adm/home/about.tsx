import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Switch,
  Button,
  Card,
  message,
  Space,
  Typography,
  Divider,
  Upload,
  Image,
} from 'antd'
import {
  SaveOutlined,
  UploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import AdminLayout from '../../../components/AdminLayout'
import Head from 'next/head'
import dynamic from 'next/dynamic'

// Importar CKEditor dinamicamente para evitar problemas de SSR
const PostEditor = dynamic(() => import('../../../components/PostEditor'), {
  ssr: false,
  loading: () => <div>Carregando editor...</div>
})

const { Title, Text } = Typography

interface HomeAboutData {
  id?: number
  title: string
  content: string
  photo?: string
  download_button_text: string
  download_file?: string
  is_active: boolean
}

export default function HomeAboutPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [homeAboutData, setHomeAboutData] = useState<HomeAboutData | null>(null)
  const [editorContent, setEditorContent] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)
  const [fileUploading, setFileUploading] = useState(false)

  const fetchHomeAbout = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pg/home-about')
      const data = await response.json()
      
      console.log('🔄 Dados carregados da API:', data)
      console.log('🔄 homeAbout:', data.homeAbout)
      console.log('🔄 download_file:', data.homeAbout?.download_file)
      
      if (data.homeAbout) {
        const aboutData = data.homeAbout
        setHomeAboutData(aboutData)
        setEditorContent(aboutData.content)
        
        const formValues = {
          title: aboutData.title,
          download_button_text: aboutData.download_button_text,
          photo: aboutData.photo,
          download_file: aboutData.download_file,
          is_active: aboutData.is_active,
        }
        
        console.log('🔄 Valores sendo definidos no formulário:', formValues)
        form.setFieldsValue(formValues)
        
        // Verificar se os valores foram definidos corretamente
        setTimeout(() => {
          console.log('🔄 Valores do formulário após setFieldsValue:', form.getFieldsValue())
        }, 100)
      } else {
        // Valores padrão se não há conteúdo
        const defaultValues = {
          title: 'Sobre Andre Paravela',
          download_button_text: 'Baixe o novo material',
          is_active: true,
        }
        
        console.log('🔄 Valores padrão sendo definidos:', defaultValues)
        form.setFieldsValue(defaultValues)
        setEditorContent('<p>Formado em Ciências contábeis e em direito pela <a href="https://www.puc.br/campinas" target="_blank">PUC</a> de Campinas, com pós graduação em Finanças pela <a href="https://www.usp.br/esalq" target="_blank">USP Esalq</a>, executivo de Finanças Global com mais de 20 anos de experiência em corporações multinacionais e firmas do Big Four.</p>')
      }
    } catch (error) {
      console.error('Erro ao buscar conteúdo:', error)
      message.error('Erro ao carregar conteúdo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHomeAbout()
  }, [])

  const handleSave = async (values: HomeAboutData) => {
    try {
      setSaving(true)

      // Obter o valor atual do campo download_file do formulário
      const currentDownloadFile = form.getFieldValue('download_file')
      
      const submitData = {
        ...values,
        content: editorContent,
        download_file: currentDownloadFile, // Garantir que o campo seja incluído
        id: homeAboutData?.id
      }

      console.log('💾 Dados sendo enviados para API:', submitData)
      console.log('💾 download_file no submitData:', submitData.download_file)
      console.log('💾 currentDownloadFile do form:', currentDownloadFile)

      const url = '/api/pg/home-about'
      const method = homeAboutData?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()
      console.log('💾 Resposta da API:', data)

      if (response.ok) {
        message.success(
          homeAboutData?.id 
            ? 'Conteúdo atualizado com sucesso'
            : 'Conteúdo criado com sucesso'
        )
        fetchHomeAbout() // Recarregar dados
      } else {
        message.error(data.message || 'Erro ao salvar conteúdo')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      message.error('Erro ao salvar conteúdo')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (file: File) => {
    setPhotoUploading(true)
    
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
        const photoUrl = result.files[0].url
        form.setFieldsValue({ photo: photoUrl })
        setHomeAboutData(prev => prev ? { ...prev, photo: photoUrl } : null)
        message.success('Foto carregada com sucesso')
      } else {
        throw new Error(result.error || 'Erro desconhecido no upload')
      }

    } catch (error) {
      console.error('Erro no upload da foto:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      message.error(`Erro no upload: ${errorMessage}`)
    } finally {
      setPhotoUploading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    setFileUploading(true)
    
    try {
      console.log('📁 Iniciando upload do arquivo:', {
        name: file.name,
        size: file.size,
        type: file.type
      })
      
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
      console.log('📁 Resultado do upload:', result)
      
      if (result.success) {
        const fileUrl = result.files[0].url
        console.log('📁 URL do arquivo obtida:', fileUrl)
        
        // Atualizar o formulário
        form.setFieldsValue({ download_file: fileUrl })
        
        // Atualizar o estado local
        setHomeAboutData(prev => {
          const newData = prev ? { ...prev, download_file: fileUrl } : null
          console.log('📁 Novo estado homeAboutData:', newData)
          return newData
        })
        
        console.log('📁 Estado atualizado:', {
          formValue: form.getFieldValue('download_file'),
          homeAboutData: homeAboutData ? { ...homeAboutData, download_file: fileUrl } : null
        })
        
        // Forçar re-render do componente
        setTimeout(() => {
          console.log('📁 Estado após timeout:', {
            formValue: form.getFieldValue('download_file'),
            currentFile: form.getFieldValue('download_file')
          })
        }, 100)
        
        message.success('Arquivo carregado com sucesso')
      } else {
        throw new Error(result.error || 'Erro desconhecido no upload')
      }

    } catch (error) {
      console.error('Erro no upload do arquivo:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      message.error(`Erro no upload: ${errorMessage}`)
    } finally {
      setFileUploading(false)
    }
  }

  const photoUploadProps = {
    name: 'photo',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file: File) => {
      // Validação de tipo
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('Você só pode fazer upload de arquivos de imagem!')
        return false
      }
      
      // Validação de tamanho (10MB para imagens)
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error('Imagem deve ter menos de 10MB!')
        return false
      }
      
      // Upload customizado
      handlePhotoUpload(file)
      return false // Previne upload automático
    },
  }

  const fileUploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file: File) => {
      // Validação de tamanho (100MB para arquivos)
      const isLt100M = file.size / 1024 / 1024 < 100
      if (!isLt100M) {
        message.error('Arquivo deve ter menos de 100MB!')
        return false
      }
      
      // Upload customizado
      handleFileUpload(file)
      return false // Previne upload automático
    },
  }

  const currentPhoto = form.getFieldValue('photo')
  const currentFile = form.getFieldValue('download_file')

  console.log('🔍 Estado atual do formulário:', {
    currentPhoto,
    currentFile,
    formValues: form.getFieldsValue(),
    homeAboutData
  })

  return (
    <>
      <Head>
        <title>Home - Sobre - Globaliza Contabil</title>
      </Head>
      
      <AdminLayout>
        <div style={{ padding: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div>
              <Title level={2} style={{ margin: 0, color: '#001529' }}>
                Home - Seção Sobre
              </Title>
              <Text type="secondary">
                Configure o conteúdo da seção Sobre na página inicial
              </Text>
            </div>
          </div>

          <Card loading={loading}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                is_active: true,
              }}
            >
              <Form.Item
                name="title"
                label="Título da Seção"
                rules={[
                  { required: true, message: 'Título é obrigatório' },
                  { max: 100, message: 'Título deve ter no máximo 100 caracteres' }
                ]}
              >
                <Input 
                  placeholder="Ex: Sobre Andre Paravela"
                  size="large"
                  maxLength={100}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label="Conteúdo"
                required
              >
                <PostEditor
                  value={editorContent}
                  onChange={setEditorContent}
                />
              </Form.Item>

              <Divider />

              <Title level={4}>Foto do Perfil</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                Carregue uma foto para o perfil. Se não carregar nenhuma, será usada a foto padrão.
              </Text>

              <Form.Item name="photo">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Upload {...photoUploadProps}>
                    <Button 
                      icon={<UploadOutlined />} 
                      loading={photoUploading}
                      type="primary"
                    >
                      {currentPhoto ? 'Alterar Foto' : 'Carregar Foto'}
                    </Button>
                  </Upload>
                  
                  {currentPhoto && (
                    <>
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          form.setFieldsValue({ photo: undefined })
                          setHomeAboutData(prev => prev ? { ...prev, photo: undefined } : null)
                        }}
                      >
                        Remover
                      </Button>
                      <Image
                        src={currentPhoto}
                        alt="Foto atual"
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                      />
                    </>
                  )}
                </div>
              </Form.Item>

              <Divider />

              <Title level={4}>Botão de Download</Title>

              <Form.Item
                name="download_button_text"
                label="Texto do Botão"
                rules={[
                  { required: true, message: 'Texto do botão é obrigatório' },
                  { max: 50, message: 'Texto do botão deve ter no máximo 50 caracteres' }
                ]}
              >
                <Input 
                  placeholder="Ex: Baixe o novo material"
                  size="large"
                  maxLength={50}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label="Arquivo para Download"
              >
                <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                  Carregue um arquivo (PDF, DOC, etc.) que será baixado quando o usuário clicar no botão.
                </Text>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Upload {...fileUploadProps}>
                    <Button 
                      icon={<UploadOutlined />} 
                      loading={fileUploading}
                    >
                      {currentFile ? 'Alterar Arquivo' : 'Carregar Arquivo'}
                    </Button>
                  </Upload>
                  
                  {currentFile && (
                    <>
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          form.setFieldsValue({ download_file: undefined })
                          setHomeAboutData(prev => prev ? { ...prev, download_file: undefined } : null)
                        }}
                      >
                        Remover
                      </Button>
                      <Button
                        type="link"
                        onClick={() => window.open(currentFile, '_blank')}
                      >
                        Ver arquivo atual
                      </Button>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Arquivo: {currentFile.split('/').pop()}
                      </Text>
                    </>
                  )}
                </div>
              </Form.Item>

              <Divider />

              <Form.Item
                name="is_active"
                label="Ativo"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={saving}
                    icon={<SaveOutlined />}
                    size="large"
                  >
                    {homeAboutData?.id ? 'Atualizar' : 'Salvar'}
                  </Button>
                  
                  {homeAboutData?.id && (
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      size="large"
                      onClick={async () => {
                        try {
                          const confirmed = window.confirm(
                            'Tem certeza que deseja deletar este conteúdo? Esta ação não pode ser desfeita.'
                          )
                          
                          if (confirmed) {
                            setSaving(true)
                            const response = await fetch('/api/pg/home-about', {
                              method: 'DELETE',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({ id: homeAboutData.id }),
                            })

                            if (response.ok) {
                              message.success('Conteúdo deletado com sucesso')
                              setHomeAboutData(null)
                              form.resetFields()
                              setEditorContent('<p>Formado em Ciências contábeis e em direito pela <a href="https://www.puc.br/campinas" target="_blank">PUC</a> de Campinas, com pós graduação em Finanças pela <a href="https://www.usp.br/esalq" target="_blank">USP Esalq</a>, executivo de Finanças Global com mais de 20 anos de experiência em corporações multinacionais e firmas do Big Four.</p>')
                              form.setFieldsValue({
                                title: 'Sobre Andre Paravela',
                                download_button_text: 'Baixe o novo material',
                                is_active: true,
                              })
                            } else {
                              const data = await response.json()
                              message.error(data.message || 'Erro ao deletar conteúdo')
                            }
                          }
                        } catch (error) {
                          console.error('Erro ao deletar:', error)
                          message.error('Erro ao deletar conteúdo')
                        } finally {
                          setSaving(false)
                        }
                      }}
                    >
                      Deletar
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </AdminLayout>
    </>
  )
}
