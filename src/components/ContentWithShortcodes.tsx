import React from 'react'
import { Box } from '@chakra-ui/react'
import { useShortcodeProcessor } from '@/hooks/useShortcodeProcessor'

interface ContentWithShortcodesProps {
  content: string
  className?: string
  autoProcess?: boolean
  showShortcodeInfo?: boolean
}

export default function ContentWithShortcodes({ 
  content, 
  className = '', 
  autoProcess = true,
  showShortcodeInfo = false 
}: ContentWithShortcodesProps) {
  const { processedContent, hasShortcodes, processContent, revertContent } = useShortcodeProcessor({
    content,
    autoProcess
  })

  if (!content) {
    return null
  }

  return (
    <Box className={className}>
      {/* Informações sobre shortcodes (opcional) */}
      {showShortcodeInfo && hasShortcodes && (
        <Box 
          mb={4} 
          p={3} 
          bg="blue.50" 
          border="1px solid" 
          borderColor="blue.200" 
          borderRadius="md"
          fontSize="sm"
        >
          <Box fontWeight="bold" color="blue.700" mb={1}>
            📝 Shortcodes Detectados
          </Box>
          <Box color="blue.600" mb={2}>
            Este conteúdo contém shortcodes que foram processados automaticamente.
          </Box>
          <Box display="flex" gap={2}>
            <button
              onClick={processContent}
              style={{
                background: '#3182ce',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              🔄 Reprocessar
            </button>
            <button
              onClick={revertContent}
              style={{
                background: '#718096',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ↩️ Reverter
            </button>
          </Box>
        </Box>
      )}

      {/* Conteúdo processado */}
      <Box
        dangerouslySetInnerHTML={{ __html: processedContent }}
        sx={{
          // Estilos para o sitemap renderizado
          '.sitemap-shortcode': {
            margin: '2rem 0',
            padding: '1rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: '#f7fafc'
          },
          '.sitemap-shortcode a:hover': {
            textDecoration: 'underline'
          },
          '.sitemap-shortcode .category-header:hover': {
            backgroundColor: '#edf2f7'
          },
          '.sitemap-shortcode .category-posts a:hover': {
            backgroundColor: '#f7fafc',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px'
          }
        }}
      />
    </Box>
  )
}

// Componente específico para páginas/posts
export function PageContent({ content, className = '' }: { content: string; className?: string }) {
  return (
    <ContentWithShortcodes
      content={content}
      className={className}
      autoProcess={true}
      showShortcodeInfo={false}
    />
  )
}

// Componente para conteúdo administrativo (com informações de shortcode)
export function AdminContent({ content, className = '' }: { content: string; className?: string }) {
  return (
    <ContentWithShortcodes
      content={content}
      className={className}
      autoProcess={true}
      showShortcodeInfo={true}
    />
  )
}
