import React, { useEffect, useRef } from 'react'
import { Box, Container, Heading, Text, Link, VStack, SimpleGrid, Divider, Spinner, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react'
import NextLink from 'next/link'

interface SitemapShortcodeProps {
  showTitle?: boolean
  className?: string
}

interface Post {
  id: number
  title: string
  slug: string
  category: {
    name: string
  }
}

interface Category {
  id: number
  name: string
}

interface Page {
  id: number
  title: string
  slug: string
}

interface MenuItem {
  id: number
  title: string
  url?: string
  children?: MenuItem[]
}

interface Menu {
  id: number
  name: string
  location: string
  menu_items: MenuItem[]
}

export default function SitemapShortcode({ showTitle = true, className = '' }: SitemapShortcodeProps) {
  const [posts, setPosts] = React.useState<Post[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [pages, setPages] = React.useState<Page[]>([])
  const [menus, setMenus] = React.useState<Menu[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchSitemapData()
  }, [])

  const fetchSitemapData = async () => {
    try {
      setLoading(true)
      
      // Buscar posts publicados
      const postsResponse = await fetch('/api/pg/posts?status=published&limit=1000')
      const postsData = await postsResponse.json()
      
      // Buscar categorias ativas
      const categoriesResponse = await fetch('/api/pg/categories?is_active=true')
      const categoriesData = await categoriesResponse.json()
      
      // Buscar páginas publicadas
      const pagesResponse = await fetch('/api/pg/pages?status=published&limit=1000')
      const pagesData = await pagesResponse.json()
      
      // Buscar menus ativos
      const menusResponse = await fetch('/api/pg/menus?is_active=true&include_items=true')
      const menusData = await menusResponse.json()

      setPosts(postsData.posts || [])
      setCategories(categoriesData.categories || [])
      setPages(pagesData.pages || [])
      setMenus(menusData.menus || [])
    } catch (error) {
      console.error('❌ Erro ao carregar dados do sitemap:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderMenuItem = (item: MenuItem) => (
    <Box key={item.id} ml={4}>
      <NextLink href={item.url || '#'} passHref>
        <Link color="primary.500" _hover={{ textDecoration: 'underline' }}>
          {item.title}
        </Link>
      </NextLink>
      {item.children && item.children.length > 0 && (
        <VStack align="start" ml={4} mt={2} spacing={1}>
          {item.children.map(renderMenuItem)}
        </VStack>
      )}
    </Box>
  )

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="primary.500" />
        <Text mt={4}>Carregando sitemap...</Text>
      </Box>
    )
  }

  return (
    <Box className={className}>
      {showTitle && (
        <Box textAlign="center" mb={8}>
          <Heading as="h1" size="xl" color="primary.500" mb={4}>
            Mapa do Site
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Navegue por todas as páginas e conteúdos do nosso site
          </Text>
        </Box>
      )}

      <Container maxW="container.xl" px={4}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          
          {/* Páginas Principais */}
          <Box>
            <Heading as="h2" size="md" color="primary.500" mb={4}>
              Páginas Principais
            </Heading>
            <VStack align="start" spacing={2}>
              <NextLink href="/" passHref>
                <Link color="primary.500" _hover={{ textDecoration: 'underline' }}>
                  Home
                </Link>
              </NextLink>
              <NextLink href="/blog" passHref>
                <Link color="primary.500" _hover={{ textDecoration: 'underline' }}>
                  Blog
                </Link>
              </NextLink>
              {pages.map((page) => (
                <NextLink key={page.id} href={`/page/${page.slug}`} passHref>
                  <Link color="primary.500" _hover={{ textDecoration: 'underline' }}>
                    {page.title}
                  </Link>
                </NextLink>
              ))}
            </VStack>
          </Box>

          {/* Categorias */}
          <Box>
            <Heading as="h2" size="md" color="primary.500" mb={4}>
              Categorias
            </Heading>
            <VStack align="start" spacing={2}>
              {categories.map((category) => (
                <NextLink key={category.id} href={`/blog?category=${category.id}`} passHref>
                  <Link color="primary.500" _hover={{ textDecoration: 'underline' }}>
                    {category.name}
                  </Link>
                </NextLink>
              ))}
            </VStack>
          </Box>

          {/* Posts Recentes */}
          <Box>
            <Heading as="h2" size="md" color="primary.500" mb={4}>
              Posts Recentes
            </Heading>
            <VStack align="start" spacing={2}>
              {posts.slice(0, 10).map((post) => (
                <NextLink key={post.id} href={`/post/${post.slug}`} passHref>
                  <Link color="primary.500" _hover={{ textDecoration: 'underline' }}>
                    {post.title}
                  </Link>
                </NextLink>
              ))}
            </VStack>
          </Box>
        </SimpleGrid>

        <Divider my={8} />

        {/* Menus de Navegação */}
        {menus.length > 0 && (
          <Box>
            <Heading as="h2" size="lg" color="primary.500" mb={6} textAlign="center">
              Menus de Navegação
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {menus.map((menu) => (
                <Box key={menu.id}>
                  <Heading as="h3" size="md" color="primary.500" mb={4}>
                    {menu.name}
                  </Heading>
                  <VStack align="start" spacing={2}>
                    {menu.menu_items.map(renderMenuItem)}
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}

        <Divider my={8} />

        {/* Todos os Posts por Categoria */}
        <Box>
          <Heading as="h2" size="lg" color="primary.500" mb={6} textAlign="center">
            Todos os Posts por Categoria
          </Heading>
          <Accordion allowMultiple>
            {categories.map((category) => {
              const categoryPosts = posts.filter(post => post.category?.name === category.name)
              if (categoryPosts.length === 0) return null

              return (
                <AccordionItem key={category.id}>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Text fontWeight="bold" color="primary.500">
                        {category.name} ({categoryPosts.length})
                      </Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    <VStack align="start" spacing={2}>
                      {categoryPosts.map((post) => (
                        <NextLink key={post.id} href={`/post/${post.slug}`} passHref>
                          <Link color="primary.500" _hover={{ textDecoration: 'underline' }}>
                            {post.title}
                          </Link>
                        </NextLink>
                      ))}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              )
            })}
          </Accordion>
        </Box>
      </Container>
    </Box>
  )
}

// Função para processar shortcodes em texto
export function processSitemapShortcodes(content: string): string {
  // Padrões de shortcode: [sitemap], [sitemap title=false], [sitemap title=false class=minha-classe]
  const shortcodeRegex = /\[sitemap(?:\s+([^\]]+))?\]/g
  
  return content.replace(shortcodeRegex, (match, attributes) => {
    const options: any = {}
    
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
    
    // Gerar HTML do sitemap
    return generateSitemapHTML(options)
  })
}

// Função para gerar HTML do sitemap
function generateSitemapHTML(options: { showTitle?: boolean; className?: string } = {}): string {
  const showTitle = options.showTitle !== false
  const className = options.className || ''
  
  let html = '<div class="sitemap-shortcode ' + className + '">'
  
  if (showTitle) {
    html += `
      <div class="sitemap-header" style="text-align: center; margin-bottom: 2rem;">
        <h1 style="color: #013F71; font-size: 2rem; margin-bottom: 1rem;">Mapa do Site</h1>
        <p style="color: #666; font-size: 1.1rem;">Navegue por todas as páginas e conteúdos do nosso site</p>
      </div>
    `
  }
  
  html += `
    <div class="sitemap-container" style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
        
        <!-- Páginas Principais -->
        <div class="sitemap-section">
          <h2 style="color: #013F71; font-size: 1.25rem; margin-bottom: 1rem;">Páginas Principais</h2>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <a href="/" style="color: #013F71; text-decoration: none;">Home</a>
            <a href="/blog" style="color: #013F71; text-decoration: none;">Blog</a>
            <a href="/site-map" style="color: #013F71; text-decoration: none;">Mapa do Site</a>
          </div>
        </div>
        
        <!-- Categorias -->
        <div class="sitemap-section">
          <h2 style="color: #013F71; font-size: 1.25rem; margin-bottom: 1rem;">Categorias</h2>
          <div class="categories-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
            <span style="color: #666;">Carregando categorias...</span>
          </div>
        </div>
        
        <!-- Posts Recentes -->
        <div class="sitemap-section">
          <h2 style="color: #013F71; font-size: 1.25rem; margin-bottom: 1rem;">Posts Recentes</h2>
          <div class="posts-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
            <span style="color: #666;">Carregando posts...</span>
          </div>
        </div>
      </div>
      
      <hr style="margin: 2rem 0; border: 1px solid #e2e8f0;">
      
      <!-- Posts por Categoria -->
      <div class="posts-by-category">
        <h2 style="color: #013F71; font-size: 1.5rem; margin-bottom: 1.5rem; text-align: center;">Todos os Posts por Categoria</h2>
        <div class="categories-accordion">
          <span style="color: #666; text-align: center; display: block;">Carregando posts por categoria...</span>
        </div>
      </div>
    </div>
  `
  
  html += '</div>'
  
  // Adicionar script para carregar dados dinamicamente
  html += `
    <script>
      (function() {
        const container = document.querySelector('.sitemap-shortcode:last-child');
        if (container) {
          loadSitemapData(container);
        }
      })();
    </script>
  `
  
  return html
}

// Função para carregar dados do sitemap
async function loadSitemapData(container: Element) {
  try {
    // Buscar categorias
    const categoriesResponse = await fetch('/api/pg/categories?is_active=true')
    const categoriesData = await categoriesResponse.json()
    
    // Buscar posts
    const postsResponse = await fetch('/api/pg/posts?status=published&limit=1000')
    const postsData = await postsResponse.json()
    
    // Buscar páginas
    const pagesResponse = await fetch('/api/pg/pages?status=published&limit=1000')
    const pagesData = await pagesResponse.json()
    
    // Atualizar categorias
    const categoriesList = container.querySelector('.categories-list')
    if (categoriesList && categoriesData.categories) {
      categoriesList.innerHTML = categoriesData.categories.map((cat: any) => 
        `<a href="/blog?category=${cat.id}" style="color: #013F71; text-decoration: none;">${cat.name}</a>`
      ).join('')
    }
    
    // Atualizar posts recentes
    const postsList = container.querySelector('.posts-list')
    if (postsList && postsData.posts) {
      postsList.innerHTML = postsData.posts.slice(0, 10).map((post: any) => 
        `<a href="/post/${post.slug}" style="color: #013F71; text-decoration: none;">${post.title}</a>`
      ).join('')
    }
    
    // Atualizar posts por categoria
    const categoriesAccordion = container.querySelector('.categories-accordion')
    if (categoriesAccordion && categoriesData.categories && postsData.posts) {
      let accordionHtml = ''
      categoriesData.categories.forEach((category: any) => {
        const categoryPosts = postsData.posts.filter((post: any) => post.category?.name === category.name)
        if (categoryPosts.length > 0) {
          accordionHtml += `
            <div class="category-item" style="margin-bottom: 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem;">
              <button class="category-header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'" 
                      style="width: 100%; padding: 1rem; background: #f7fafc; border: none; text-align: left; cursor: pointer; border-radius: 0.5rem 0.5rem 0 0;">
                <span style="font-weight: bold; color: #013F71;">${category.name} (${categoryPosts.length})</span>
                <span style="float: right;">▼</span>
              </button>
              <div class="category-posts" style="display: none; padding: 1rem; background: white;">
                ${categoryPosts.map((post: any) => 
                  `<a href="/post/${post.slug}" style="display: block; color: #013F71; text-decoration: none; padding: 0.25rem 0;">${post.title}</a>`
                ).join('')}
              </div>
            </div>
          `
        }
      })
      categoriesAccordion.innerHTML = accordionHtml
    }
    
    // Adicionar páginas dinâmicas se existirem
    if (pagesData.pages && pagesData.pages.length > 0) {
      const pagesSection = container.querySelector('.sitemap-section')
      if (pagesSection) {
        const pagesList = pagesSection.querySelector('div')
        if (pagesList) {
          pagesData.pages.forEach((page: any) => {
            const pageLink = document.createElement('a')
            pageLink.href = `/page/${page.slug}`
            pageLink.style.cssText = 'color: #013F71; text-decoration: none;'
            pageLink.textContent = page.title
            pagesList.appendChild(pageLink)
          })
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados do sitemap:', error)
  }
}
