import React from 'react'
import { ConfigProvider } from 'antd'
import { antdTheme } from '../styles/colors'

interface AntdConfigProviderProps {
  children: React.ReactNode
}

export default function AntdConfigProvider({ children }: AntdConfigProviderProps) {
  return (
    <ConfigProvider
      theme={antdTheme}
      locale={{
        locale: 'pt-BR',
        Pagination: {
          items_per_page: '/ página',
          jump_to: 'Ir para',
          jump_to_confirm: 'confirmar',
          page: 'Página',
          prev_page: 'Página anterior',
          next_page: 'Próxima página',
          prev_5: '5 páginas anteriores',
          next_5: '5 próximas páginas',
          prev_3: '3 páginas anteriores',
          next_3: '3 próximas páginas',
        },
        Table: {
          filterTitle: 'Filtro',
          filterConfirm: 'OK',
          filterReset: 'Resetar',
          filterEmptyText: 'Sem filtros',
          emptyText: 'Nenhum dado',
          selectAll: 'Selecionar página atual',
          selectInvert: 'Inverter seleção',
          sortTitle: 'Ordenar',
        },
        Modal: {
          okText: 'OK',
          cancelText: 'Cancelar',
          justOkText: 'OK',
        },
        Popconfirm: {
          okText: 'OK',
          cancelText: 'Cancelar',
        },
        Transfer: {
          searchPlaceholder: 'Buscar',
          itemUnit: 'item',
          itemsUnit: 'itens',
        },
        Upload: {
          uploading: 'Enviando...',
          removeFile: 'Remover arquivo',
          uploadError: 'Erro no upload',
          previewFile: 'Visualizar arquivo',
          downloadFile: 'Baixar arquivo',
        },
        Empty: {
          description: 'Nenhum dado',
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
} 