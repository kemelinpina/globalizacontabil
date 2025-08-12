# 🚀 Shortcodes de Sitemap - Globaliza Contabil

## 📋 Visão Geral

O sistema de shortcodes permite inserir um sitemap completo em qualquer lugar do site usando uma sintaxe simples como `[sitemap]`. Funciona perfeitamente no **CKEditor** e em qualquer conteúdo HTML.

## 🎯 Como Usar

### **1. Uso Básico no CKEditor**

Simplesmente digite no editor:

```
[sitemap]
```

### **2. Uso com Opções**

```
[sitemap title=false]
[sitemap title=false class=meu-sitemap]
[sitemap class=minha-classe]
```

## 📝 Sintaxe dos Shortcodes

| Shortcode | Descrição | Resultado |
|-----------|-----------|-----------|
| `[sitemap]` | Sitemap com título | Mapa completo com cabeçalho |
| `[sitemap title=false]` | Sitemap sem título | Mapa compacto |
| `[sitemap class=minha-classe]` | Com classe CSS | Estilização personalizada |
| `[sitemap title=false class=compacto]` | Combinação | Sem título + classe |

## 🔧 Implementação Técnica

### **Componente Principal**
```tsx
import { PageContent } from '@/components/ContentWithShortcodes'

// Em qualquer página
<PageContent content={conteudoDoCKEditor} />
```

### **Hook Personalizado**
```tsx
import { useShortcodeProcessor } from '@/hooks/useShortcodeProcessor'

function MinhaPagina() {
  const { processedContent, hasShortcodes } = useShortcodeProcessor({
    content: conteudoDoEditor,
    autoProcess: true
  })

  return <div dangerouslySetInnerHTML={{ __html: processedContent }} />
}
```

## 🎨 Exemplos Práticos

### **Exemplo 1: Página com Sitemap**
```html
<h1>Nossa Empresa</h1>
<p>Somos especialistas em contabilidade...</p>

<!-- Sitemap como shortcode -->
[sitemap]

<p>Entre em contato conosco para mais informações.</p>
```

### **Exemplo 2: Blog Post com Sitemap Compacto**
```html
<h1>Guia de Impostos</h1>
<p>Neste artigo vamos falar sobre...</p>

<!-- Sitemap compacto -->
[sitemap title=false]

<h2>Conclusão</h2>
<p>Esperamos que este guia tenha sido útil...</p>
```

### **Exemplo 3: Página com Múltiplos Sitemaps**
```html
<h1>Recursos</h1>

<!-- Sitemap principal -->
[sitemap]

<h2>Links Úteis</h2>
<p>Aqui estão alguns links importantes:</p>

<!-- Sitemap compacto -->
[sitemap title=false class=links-uteis]
```

## 🎯 Casos de Uso

### **1. Páginas de Empresa**
- **Sobre**: `[sitemap]` para mostrar toda a estrutura do site
- **Contato**: `[sitemap title=false]` para navegação rápida
- **Serviços**: `[sitemap class=servicos]` para categorias

### **2. Blog Posts**
- **Posts Longos**: `[sitemap title=false]` para navegação
- **Guias**: `[sitemap]` para mostrar recursos relacionados
- **Categorias**: `[sitemap class=categorias]` para organização

### **3. Páginas de Ajuda**
- **FAQ**: `[sitemap]` para todas as seções
- **Tutoriais**: `[sitemap title=false]` para navegação
- **Documentação**: `[sitemap class=docs]` para estrutura

## 🔍 Funcionalidades Automáticas

O shortcode automaticamente:

- ✅ **Busca dados em tempo real** das APIs
- ✅ **Renderiza categorias** ativas
- ✅ **Lista posts recentes** (10 mais recentes)
- ✅ **Mostra menus** de navegação
- ✅ **Organiza posts por categoria** (accordion)
- ✅ **Inclui páginas dinâmicas** criadas no admin
- ✅ **É responsivo** (3 colunas desktop, 2 tablet, 1 mobile)

## 📱 Responsividade

- **Desktop**: 3 colunas de conteúdo
- **Tablet**: 2 colunas
- **Mobile**: 1 coluna
- **Grid adaptativo** automático

## 🎨 Estilização

### **Classes CSS Automáticas**
- `.sitemap-shortcode` - Container principal
- `.sitemap-header` - Cabeçalho (quando title=true)
- `.sitemap-section` - Cada seção (Páginas, Categorias, Posts)
- `.categories-accordion` - Accordion de posts por categoria

### **Estilos Personalizados**
```css
.meu-sitemap {
  border: 2px solid #013F71;
  border-radius: 12px;
  padding: 20px;
}

.sitemap-compacto {
  background: #f8f9fa;
  font-size: 14px;
}
```

## 🚀 Integração com CKEditor

### **1. Funciona Automaticamente**
- Digite `[sitemap]` no editor
- Salve o conteúdo
- O shortcode é processado automaticamente na renderização

### **2. Preview em Tempo Real**
- Use o hook `useShortcodeProcessor` para preview
- Processamento automático de shortcodes
- Validação em tempo real

### **3. Validação de Sintaxe**
```tsx
import { validateShortcodes } from '@/hooks/useShortcodeProcessor'

const { isValid, errors } = validateShortcodes(conteudo)
if (!isValid) {
  console.log('Erros nos shortcodes:', errors)
}
```

## 🔧 Componentes Disponíveis

### **ContentWithShortcodes**
Componente principal que processa qualquer conteúdo com shortcodes.

### **PageContent**
Para páginas públicas (sem informações de debug).

### **AdminContent**
Para painel administrativo (com informações de shortcodes).

### **SitemapShortcode**
Componente React do sitemap (para uso direto).

## 📊 Estrutura de Dados

O shortcode busca automaticamente:

- **Posts**: `/api/pg/posts?status=published&limit=1000`
- **Categorias**: `/api/pg/categories?is_active=true`
- **Páginas**: `/api/pg/pages?status=published&limit=1000`
- **Menus**: `/api/pg/menus?is_active=true&include_items=true`

## 🎯 Vantagens

1. **Simplicidade**: Apenas digite `[sitemap]`
2. **Flexibilidade**: Múltiplas opções de configuração
3. **Automação**: Dados sempre atualizados
4. **Responsivo**: Funciona em todos os dispositivos
5. **SEO**: Links corretos para indexação
6. **Performance**: Carregamento assíncrono de dados
7. **Manutenção**: Sem necessidade de atualizar manualmente

## 🚨 Requisitos

- Next.js configurado
- APIs funcionando para posts, categorias, páginas e menus
- Banco de dados com dados válidos
- Chakra UI para estilos (opcional)

## 💡 Dicas de Uso

1. **Use `[sitemap]`** para páginas principais
2. **Use `[sitemap title=false]`** para conteúdo inline
3. **Use classes personalizadas** para estilização específica
4. **Combine múltiplos shortcodes** em uma página
5. **Teste sempre** no preview antes de publicar

## 🔍 Debug e Desenvolvimento

### **Detectar Shortcodes**
```tsx
import { detectShortcodes } from '@/hooks/useShortcodeProcessor'

const { hasSitemap, shortcodes } = detectShortcodes(conteudo)
console.log('Shortcodes encontrados:', shortcodes)
```

### **Processamento Manual**
```tsx
import { processSitemapShortcodes } from '@/components/SitemapShortcode'

const htmlProcessado = processSitemapShortcodes(conteudo)
```

## 📝 Exemplo Completo

```html
<!DOCTYPE html>
<html>
<head>
    <title>Minha Página</title>
</head>
<body>
    <h1>Bem-vindo à Globaliza Contabil</h1>
    
    <p>Somos especialistas em contabilidade internacional...</p>
    
    <!-- Sitemap principal -->
    [sitemap]
    
    <h2>Nossos Serviços</h2>
    <p>Oferecemos diversos serviços...</p>
    
    <!-- Sitemap compacto para serviços -->
    [sitemap title=false class=servicos]
    
    <footer>
        <p>Entre em contato conosco!</p>
    </footer>
</body>
</html>
```

---

**🎉 Agora você pode usar `[sitemap]` em qualquer lugar do seu site, incluindo o CKEditor!**
