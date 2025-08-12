import { useEffect, useState } from 'react'
import { processSitemapShortcodes } from '@/components/SitemapShortcode'

interface UseShortcodeProcessorProps {
  content: string
  autoProcess?: boolean
}

export function useShortcodeProcessor({ content, autoProcess = true }: UseShortcodeProcessorProps) {
  const [processedContent, setProcessedContent] = useState<string>('')
  const [hasShortcodes, setHasShortcodes] = useState(false)

  useEffect(() => {
    if (!content) {
      setProcessedContent('')
      setHasShortcodes(false)
      return
    }

    // Verificar se há shortcodes
    const shortcodeRegex = /\[sitemap(?:\s+([^\]]+))?\]/g
    const matches = content.match(shortcodeRegex)
    const hasSitemapShortcodes = matches && matches.length > 0

    setHasShortcodes(hasSitemapShortcodes)

    if (autoProcess && hasSitemapShortcodes) {
      // Processar shortcodes
      const processed = processSitemapShortcodes(content)
      setProcessedContent(processed)
    } else {
      setProcessedContent(content)
    }
  }, [content, autoProcess])

  // Função para processar manualmente
  const processContent = () => {
    if (content) {
      const processed = processSitemapShortcodes(content)
      setProcessedContent(processed)
    }
  }

  // Função para reverter ao conteúdo original
  const revertContent = () => {
    setProcessedContent(content)
  }

  return {
    processedContent,
    hasShortcodes,
    processContent,
    revertContent,
    originalContent: content
  }
}

// Hook específico para CKEditor
export function useCKEditorShortcodeProcessor(content: string) {
  const [processedContent, setProcessedContent] = useState<string>('')

  useEffect(() => {
    if (!content) {
      setProcessedContent('')
      return
    }

    // Processar shortcodes automaticamente
    const processed = processSitemapShortcodes(content)
    setProcessedContent(processed)
  }, [content])

  return {
    processedContent,
    hasShortcodes: /\[sitemap(?:\s+([^\]]+))?\]/g.test(content)
  }
}

// Função utilitária para detectar shortcodes
export function detectShortcodes(content: string): {
  hasSitemap: boolean
  shortcodes: Array<{ type: string; attributes: string; fullMatch: string }>
} {
  const shortcodes: Array<{ type: string; attributes: string; fullMatch: string }> = []
  
  // Detectar shortcodes de sitemap
  const sitemapRegex = /\[sitemap(?:\s+([^\]]+))?\]/g
  let match
  
  while ((match = sitemapRegex.exec(content)) !== null) {
    shortcodes.push({
      type: 'sitemap',
      attributes: match[1] || '',
      fullMatch: match[0]
    })
  }

  return {
    hasSitemap: shortcodes.some(s => s.type === 'sitemap'),
    shortcodes
  }
}

// Função para validar shortcodes
export function validateShortcodes(content: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const shortcodeRegex = /\[sitemap(?:\s+([^\]]+))?\]/g
  let match

  while ((match = shortcodeRegex.exec(content)) !== null) {
    if (match[1]) {
      // Validar atributos
      const attrRegex = /(\w+)=([^\s]+)/g
      let attrMatch
      
      while ((attrMatch = attrRegex.exec(match[1])) !== null) {
        const [, key, value] = attrMatch
        
        if (key === 'title' && !['true', 'false'].includes(value)) {
          errors.push(`Atributo 'title' deve ser 'true' ou 'false', recebido: '${value}'`)
        }
        
        if (key === 'class' && !/^[a-zA-Z0-9-_]+$/.test(value)) {
          errors.push(`Atributo 'class' deve conter apenas letras, números, hífens e underscores, recebido: '${value}'`)
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
