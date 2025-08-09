import { GetServerSideProps } from 'next'
import { useState, useEffect } from 'react'
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react'
import Head from 'next/head'
import Image from 'next/image'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { prisma } from '../../lib/prisma'

interface Page {
  id: number
  title: string
  content: string
  slug: string
  excerpt?: string
  featured_image?: string
  social_image?: string
  status: string
  meta_title?: string
  meta_description?: string
  key_word_seo?: string
  is_featured: boolean
  template: string
  custom_css?: string
  custom_js?: string
  view_count: number
  published_at?: string
  created_at: string
  updated_at: string
  author: {
    id: number
    name: string
    email: string
  }
}

interface PageProps {
  page: Page | null
  notFound?: boolean
}

export default function PageView({ page, notFound }: PageProps) {
  if (notFound || !page) {
    return (
      <>
        <Head>
          <title>Página não encontrada - Globaliza Contabil</title>
        </Head>
        <Header />
        <Container maxW="container.xl" py={20}>
          <VStack spacing={8} textAlign="center">
            <Heading size="2xl" color="primary.500">
              404 - Página não encontrada
            </Heading>
            <Text fontSize="xl" color="gray.600">
              A página que você está procurando não existe ou foi removida.
            </Text>
          </VStack>
        </Container>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>
          {page.meta_title || page.title} - Globaliza Contabil
        </title>
        <meta 
          name="description" 
          content={page.meta_description || page.excerpt || `${page.title} - Globaliza Contabil`} 
        />
        {page.key_word_seo && (
          <meta name="keywords" content={page.key_word_seo} />
        )}
        
        {/* Open Graph */}
        <meta property="og:title" content={page.meta_title || page.title} />
        <meta 
          property="og:description" 
          content={page.meta_description || page.excerpt || `${page.title} - Globaliza Contabil`} 
        />
        {page.social_image && (
          <meta property="og:image" content={page.social_image} />
        )}
        <meta property="og:type" content="article" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page.meta_title || page.title} />
        <meta 
          name="twitter:description" 
          content={page.meta_description || page.excerpt || `${page.title} - Globaliza Contabil`} 
        />
        {page.social_image && (
          <meta name="twitter:image" content={page.social_image} />
        )}

        {/* CSS Personalizado */}
        {page.custom_css && (
          <style dangerouslySetInnerHTML={{ __html: page.custom_css }} />
        )}
      </Head>

      <Header />

      <Box as="main" py={8}>
        <Container maxW="container.xl">
          {/* Imagem de Destaque */}
          {page.featured_image && (
            <Box mb={8} textAlign="center">
              <Image
                src={page.featured_image}
                alt={page.title}
                width={800}
                height={400}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  maxHeight: '400px',
                  objectFit: 'cover'
                }}
              />
            </Box>
          )}

          {/* Título da Página */}
          <VStack spacing={4} align="start" mb={8}>
            <Heading 
              as="h1" 
              size="2xl" 
              color="primary.500"
              lineHeight="1.2"
            >
              {page.title}
            </Heading>
            
            {page.excerpt && (
              <Text 
                fontSize="xl" 
                color="gray.600"
                fontWeight="medium"
              >
                {page.excerpt}
              </Text>
            )}

            {/* Metadados */}
            <Box>
              <Text fontSize="sm" color="gray.500">
                Por {page.author.name} • {' '}
                {page.published_at 
                  ? new Date(page.published_at).toLocaleDateString('pt-BR')
                  : new Date(page.created_at).toLocaleDateString('pt-BR')
                } • {' '}
                {page.view_count} visualizações
              </Text>
            </Box>
          </VStack>

          {/* Conteúdo da Página */}
          <Box
            className="page-content"
            dangerouslySetInnerHTML={{ __html: page.content }}
            sx={{
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                color: 'primary.500',
                fontWeight: 'bold',
                marginBottom: '16px',
                marginTop: '24px',
              },
              '& h1': { fontSize: '2xl' },
              '& h2': { fontSize: 'xl' },
              '& h3': { fontSize: 'lg' },
              '& p': {
                marginBottom: '16px',
                lineHeight: '1.7',
                color: 'gray.700',
              },
              '& a': {
                color: 'red.500',
                textDecoration: 'underline',
                '&:hover': {
                  textDecoration: 'none',
                  color: 'red.600',
                },
              },
              '& ul, & ol': {
                marginLeft: '20px',
                marginBottom: '16px',
              },
              '& li': {
                marginBottom: '8px',
                lineHeight: '1.6',
              },
              '& blockquote': {
                borderLeft: '4px solid',
                borderColor: 'primary.500',
                paddingLeft: '16px',
                marginY: '24px',
                fontStyle: 'italic',
                color: 'gray.600',
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                marginY: '16px',
              },
              '& pre': {
                backgroundColor: 'gray.100',
                padding: '16px',
                borderRadius: '8px',
                overflow: 'auto',
                marginY: '16px',
              },
              '& code': {
                backgroundColor: 'gray.100',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: 'sm',
              },
            }}
          />
        </Container>
      </Box>

      <Footer />

      {/* JavaScript Personalizado */}
      {page.custom_js && (
        <script dangerouslySetInnerHTML={{ __html: page.custom_js }} />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params!

  try {
    const page = await prisma.pages.findUnique({
      where: { 
        slug: slug as string,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!page || page.status !== 'published') {
      return {
        props: {
          page: null,
          notFound: true
        }
      }
    }

    // Incrementar visualizações
    await prisma.pages.update({
      where: { id: page.id },
      data: { view_count: { increment: 1 } }
    })

    // Serializar datas para JSON
    const serializedPage = {
      ...page,
      created_at: page.created_at.toISOString(),
      updated_at: page.updated_at.toISOString(),
      published_at: page.published_at?.toISOString() || null,
    }

    return {
      props: {
        page: serializedPage,
        notFound: false
      }
    }
  } catch (error) {
    console.error('Erro ao buscar página:', error)
    return {
      props: {
        page: null,
        notFound: true
      }
    }
  }
}
