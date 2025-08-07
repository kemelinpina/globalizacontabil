import React, { useEffect, useRef } from 'react'
import { CKEditor } from 'ckeditor4-react'

interface PostEditorProps {
  value: string
  onChange: (data: string) => void
}

interface CKEditorEvent {
  editor: {
    getData: () => string
    setData: (data: string) => void
    [key: string]: unknown
  }
}

export default function PostEditor({ value, onChange }: PostEditorProps) {
  const editorRef = useRef<CKEditorEvent['editor'] | null>(null)

  const editorConfig = {
    height: 400,
    toolbar: [
      { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', '-', 'RemoveFormat'] },
      { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
      { name: 'links', items: ['Link', 'Unlink'] },
      { name: 'insert', items: ['Image', 'Table', 'HorizontalRule', 'SpecialChar'] },
      '/',
      { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
      { name: 'colors', items: ['TextColor', 'BGColor'] },
      { name: 'tools', items: ['Maximize', 'Source'] }
    ],
    removeButtons: '',
    format_tags: 'p;h1;h2;h3;pre',
    removeDialogTabs: 'image:advanced;link:advanced',
    language: 'pt-br',
    contentsCss: ['https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap'],
    font_names: 'Roboto/Roboto;Arial/Arial;Times New Roman/Times New Roman;Verdana/Verdana',
    fontSize_sizes: '8/8px;9/9px;10/10px;11/11px;12/12px;14/14px;16/16px;18/18px;20/20px;22/22px;24/24px;26/26px;28/28px;36/36px;48/48px;72/72px',
    colorButton_colors: '000,800000,8B4513,2F4F4F,008080,000080,4B0082,696969,B22222,A52A2A,DAA520,006400,40E0D0,0000CD,800080,808080,F00,FF8C00,FFD700,008000,0FF,00F,EE82EE,A0A0A0,ADD8E6,DDA0DD,D3D3D3,FFF0F5,FAEBD7,FFFFE0,F0FFF0,F0FFFF,F0F8FF,E6E6FA,FFF',
    colorButton_colorsPerRow: 6,
    colorButton_enableAutomatic: false,
    colorButton_enableMore: true,
    allowedContent: true,
    autoUpdateElement: true,
    disableAutoInline: true,
    removePlugins: 'elementspath,resize',
    resize_enabled: false,
    startupShowBorders: false,
    startupOutlineBlocks: false,
    startupFocus: false,
    autoParagraph: false,
    fillEmptyBlocks: false,
    on: {
      instanceReady: function(evt: CKEditorEvent) {
        editorRef.current = evt.editor
        console.log('CKEditor carregado com sucesso!')
        
        // Definir o conteúdo inicial
        if (value && value.trim()) {
          evt.editor.setData(value)
        }
      },
      change: function(evt: CKEditorEvent) {
        const data = evt.editor.getData()
        onChange(data)
      },
      blur: function(evt: CKEditorEvent) {
        const data = evt.editor.getData()
        onChange(data)
      }
    }
  }

  // Atualizar o conteúdo quando o valor mudar externamente
  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      const currentData = editorRef.current.getData()
      if (currentData !== value) {
        editorRef.current.setData(value)
      }
    }
  }, [value])

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}>
      <CKEditor
        data={value}
        config={editorConfig}
        onChange={(evt: CKEditorEvent) => {
          const data = evt.editor.getData()
          onChange(data)
        }}
            />
    </div>
  )
} 