import { prisma } from '@/lib/prisma'

interface Category {
  id: number
  name: string
}

interface Post {
  id: number
  title: string
  slug: string
  category?: {
    name: string
  }
}

interface Page {
  id: number
  title: string
  slug: string
}

interface MenuItem {
  id: number
  title: string
  url: string | null
}

interface Menu {
  id: number
  name: string
  menu_items: MenuItem[]
}

interface SitemapData {
  categories: Category[]
  posts: Post[]
  pages: Page[]
  menus: Menu[]
}

// Função para carregar dados do sitemap no backend
async function loadSitemapData(): Promise<SitemapData> {
  try {
    // Buscar categorias ativas
    const categories = await prisma.categories.findMany({
      where: { is_active: true },
      select: { id: true, name: true }
    })

    // Buscar posts publicados
    const posts = await prisma.posts.findMany({
      where: { status: 'published' },
      select: { 
        id: true, 
        title: true, 
        slug: true,
        category: {
          select: { name: true }
        }
      },
      take: 1000
    })

    // Buscar páginas publicadas
    const pages = await prisma.pages.findMany({
      where: { status: 'published' },
      select: { id: true, title: true, slug: true },
      take: 1000
    })

    // Buscar menus ativos
    const menus = await prisma.menus.findMany({
      where: { is_active: true },
      include: {
        menu_items: {
          where: { is_active: true },
          orderBy: { order: 'asc' }
        }
      }
    })

    return { categories, posts, pages, menus }
  } catch (error) {
    console.error('❌ Erro ao carregar dados do sitemap no backend:', error)
    return { categories: [], posts: [], pages: [], menus: [] }
  }
}

// Função para gerar HTML do sitemap com dados já carregados
function generateSitemapHTML(data: SitemapData, options: { showTitle?: boolean; className?: string } = {}): string {
  const showTitle = options.showTitle !== false
  const className = options.className || ''
  
  let html = '<div class="sitemap-shortcode ' + className + '" style="margin: 1rem 0; padding: 1rem; border: none; border-radius: 8px; background-color: #f7fafc; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">'
  
  // Adicionar CSS responsivo inline
  html += `
    <style>
      @media (max-width: 768px) {
        .sitemap-shortcode .sitemap-container {
          padding: 0 0.5rem !important;
        }
        .sitemap-shortcode .sitemap-container > div:first-child {
          grid-template-columns: 1fr !important;
          gap: 1.5rem !important;
          margin-bottom: 1.5rem !important;
        }
        .sitemap-shortcode h2 {
          font-size: 1.1rem !important;
          margin-bottom: 0.75rem !important;
        }
        .sitemap-shortcode h3 {
          font-size: 1.1rem !important;
          margin-bottom: 0.75rem !important;
        }
        .sitemap-shortcode hr {
          margin: 1.5rem 0 !important;
        }
        .sitemap-shortcode .posts-by-category h2 {
          font-size: 1.3rem !important;
          margin-bottom: 1rem !important;
        }
        .sitemap-shortcode .menus-section h2 {
          font-size: 1.3rem !important;
          margin-bottom: 1rem !important;
        }
        .sitemap-shortcode .menus-section > div {
          grid-template-columns: 1fr !important;
          gap: 1.5rem !important;
        }
        .sitemap-shortcode .category-header {
          padding: 0.75rem !important;
        }
        .sitemap-shortcode .category-header span:first-child {
          font-size: 1rem !important;
        }
        .sitemap-shortcode .category-header span:last-child {
          font-size: 0.8rem !important;
        }
        .sitemap-shortcode .category-posts {
          padding: 0.75rem !important;
        }
      }
      @media (max-width: 480px) {
        .sitemap-shortcode {
          margin: 0.5rem 0 !important;
          padding: 0.75rem !important;
        }
        .sitemap-shortcode .sitemap-container {
          padding: 0 0.25rem !important;
        }
        .sitemap-shortcode .sitemap-container > div:first-child {
          gap: 1rem !important;
          margin-bottom: 1rem !important;
        }
        .sitemap-shortcode a {
          padding: 0.75rem !important;
          font-size: 0.9rem !important;
        }
        .sitemap-shortcode h2 {
          font-size: 1rem !important;
          margin-bottom: 0.5rem !important;
        }
        .sitemap-shortcode h3 {
          font-size: 1rem !important;
          margin-bottom: 0.5rem !important;
        }
      }
    </style>
  `
  
  
  html += `
    <div class="sitemap-container" style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
        
        <!-- Páginas Principais -->
        <div class="sitemap-section">
          <h2 style="color: #013F71; font-size: 1.25rem; margin-bottom: 1rem; font-weight: 600;">Páginas Principais</h2>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <a href="/" style="color: #013F71; text-decoration: none; display: block; margin-bottom: 0.5rem; padding: 0.5rem; border-radius: 4px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e2e8f0'" onmouseout="this.style.backgroundColor='transparent'">Home</a>
            <a href="/blog" style="color: #013F71; text-decoration: none; display: block; margin-bottom: 0.5rem; padding: 0.5rem; border-radius: 4px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e2e8f0'" onmouseout="this.style.backgroundColor='transparent'">Blog</a>
            <a href="/site-map" style="color: #013F71; text-decoration: none; display: block; margin-bottom: 0.5rem; padding: 0.5rem; border-radius: 4px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e2e8f0'" onmouseout="this.style.backgroundColor='transparent'">Mapa do Site</a>
            ${data.pages.map(page => 
              `<a href="/page/${page.slug}" style="color: #013F71; text-decoration: none; display: block; margin-bottom: 0.5rem; padding: 0.5rem; border-radius: 4px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e2e8f0'" onmouseout="this.style.backgroundColor='transparent'">${page.title}</a>`
            ).join('')}
          </div>
        </div>
        
        <!-- Categorias -->
        <div class="sitemap-section">
          <h2 style="color: #013F71; font-size: 1.25rem; margin-bottom: 1rem; font-weight: 600;">Categorias</h2>
          <div class="categories-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${data.categories.length > 0 
              ? data.categories.map(cat => 
                  `<a href="/blog?category=${cat.id}" style="color: #013F71; text-decoration: none; display: block; margin-bottom: 0.5rem; padding: 0.5rem; border-radius: 4px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e2e8f0'" onmouseout="this.style.backgroundColor='transparent'">${cat.name}</a>`
                ).join('')
              : '<span style="color: #666; padding: 0.5rem;">Nenhuma categoria encontrada</span>'
            }
          </div>
        </div>
        
        <!-- Posts Recentes -->
        <div class="sitemap-section">
          <h2 style="color: #013F71; font-size: 1.25rem; margin-bottom: 1rem; font-weight: 600;">Posts Recentes</h2>
          <div class="posts-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${data.posts.length > 0 
              ? data.posts.slice(0, 10).map(post => 
                  `<a href="/post/${post.slug}" style="color: #013F71; text-decoration: none; display: block; margin-bottom: 0.5rem; padding: 0.5rem; border-radius: 4px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e2e8f0'" onmouseout="this.style.backgroundColor='transparent'">${post.title}</a>`
                ).join('')
              : '<span style="color: #666; padding: 0.5rem;">Nenhum post encontrado</span>'
            }
          </div>
        </div>
      </div>
      
      <hr style="margin: 2rem 0; border: 1px solid #e2e8f0;">
      
      <!-- Posts por Categoria -->
      <div class="posts-by-category">
        <h2 style="color: #013F71; font-size: 1.5rem; margin-bottom: 1.5rem; text-align: center; font-weight: 600;">Todos os Posts por Categoria</h2>
        <div class="categories-accordion">
          ${data.categories.length > 0 
            ? data.categories.map(category => {
                const categoryPosts = data.posts.filter(post => post.category && post.category.name === category.name)
                if (categoryPosts.length === 0) return ''
                
                return `
                  <div class="category-item" style="margin-bottom: 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; overflow: hidden;">
                    <button class="category-header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'" 
                            style="width: 100%; padding: 1rem; background: #f7fafc; border: none; text-align: left; cursor: pointer; border-radius: 0.5rem 0.5rem 0 0; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#edf2f7'" onmouseout="this.style.backgroundColor='#f7fafc'">
                      <span style="font-weight: 600; color: #013F71; font-size: 1.1rem;">${category.name} (${categoryPosts.length})</span>
                      <span style="float: right; font-size: 0.9rem;">▼</span>
                    </button>
                    <div class="category-posts" style="display: none; padding: 1rem; background: white;">
                      ${categoryPosts.map(post => 
                        `<a href="/post/${post.slug}" style="display: block; color: #013F71; text-decoration: none; padding: 0.5rem; margin-bottom: 0.25rem; border-radius: 4px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f7fafc'" onmouseout="this.style.backgroundColor='transparent'">${post.title}</a>`
                      ).join('')}
                    </div>
                  </div>
                `
              }).join('')
            : '<span style="color: #666; text-align: center; display: block; padding: 1rem;">Nenhuma categoria encontrada</span>'
          }
        </div>
      </div>
      
      <!-- Menus de Navegação -->
      ${data.menus.length > 0 ? `
        <hr style="margin: 2rem 0; border: 1px solid #e2e8f0;">
        <div class="menus-section">
          <h2 style="color: #013F71; font-size: 1.5rem; margin-bottom: 1.5rem; text-align: center; font-weight: 600;">Menus de Navegação</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
            ${data.menus.map(menu => `
              <div class="menu-section">
                <h3 style="color: #013F71; font-size: 1.25rem; margin-bottom: 1rem; font-weight: 600;">${menu.name}</h3>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                  ${menu.menu_items.map((item: MenuItem) => 
                    `<a href="${item.url || '#'}" style="color: #013F71; text-decoration: none; display: block; margin-bottom: 0.5rem; padding: 0.5rem; border-radius: 4px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e2e8f0'" onmouseout="this.style.backgroundColor='transparent'">${item.title}</a>`
                  ).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `
  
  html += '</div>'
  
  return html
}

// Função principal para processar shortcodes no backend
export async function processSitemapShortcodesBackend(content: string): Promise<string> {
  // Padrões de shortcode: [sitemap], [sitemap title=false], [sitemap title=false class=minha-classe]
  const shortcodeRegex = /\[sitemap(?:\s+([^\]]+))?\]/g
  
  // Se não há shortcodes, retorna o conteúdo original
  if (!shortcodeRegex.test(content)) {
    return content
  }
  
  // Carregar dados no backend
  const sitemapData = await loadSitemapData()
  
  // Processar shortcodes
  return content.replace(shortcodeRegex, (match, attributes) => {
    const options: { showTitle?: boolean; className?: string } = {}
    
          if (attributes) {
        // Parse attributes: title=false class=minha-classe
        const attrRegex = /(\w+)=([^\s]+)/g
        let attrMatch
        while ((attrMatch = attrRegex.exec(attributes)) !== null) {
          const [, key, value] = attrMatch
          if (key === 'title') {
            options.showTitle = value !== 'false'
          } else if (key === 'class') {
            options.className = value
          }
        }
      }
    
    // Gerar HTML do sitemap com dados já carregados
    return generateSitemapHTML(sitemapData, options)
  })
}

// Função para verificar se o conteúdo tem shortcodes
export function hasSitemapShortcodes(content: string): boolean {
  const shortcodeRegex = /\[sitemap(?:\s+([^\]]+))?\]/g
  return shortcodeRegex.test(content)
}
