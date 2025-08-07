import React from 'react'
import { Box, Heading, Text } from '@chakra-ui/react'
import Head from 'next/head'
import HeroSection from '@/components/HeroSection'
import PostsCarousel from '../components/PostsCarousel'
import BannerWhatsApp from '../components/BannerWhatsApp'
import Footer from '../components/Footer'

export default function Home() {
  // Dados mock para testar o PostsCarousel
  const mockPosts = [
    {
      id: 1,
      title: "Como se preparar para a certificação CPA",
      excerpt: "Dicas essenciais para conquistar sua certificação CPA e avançar na carreira contábil internacional.",
      featured_image: "/default.png",
      slug: "como-se-preparar-cpa",
      published_at: "2024-01-15T10:00:00Z",
      author: {
        name: "Equipe Globaliza"
      },
      category: {
        name: "Certificações"
      }
    },
    {
      id: 2,
      title: "Diferenças entre ACCA e CPA",
      excerpt: "Entenda as principais diferenças entre as certificações ACCA e CPA para escolher a melhor para sua carreira.",
      featured_image: "/default.png",
      slug: "diferencas-acca-cpa",
      published_at: "2024-01-10T10:00:00Z",
      author: {
        name: "Equipe Globaliza"
      },
      category: {
        name: "Certificações"
      }
    },
    {
      id: 3,
      title: "Mercado de trabalho internacional",
      excerpt: "Descubra as oportunidades de trabalho no exterior para contadores certificados.",
      featured_image: "/default.png",
      slug: "mercado-trabalho-internacional",
      published_at: "2024-01-05T10:00:00Z",
      author: {
        name: "Equipe Globaliza"
      },
      category: {
        name: "Carreira"
      }
    }
  ]

  return (
    <>
      <Head>
        <title>Globaliza Contabil - Blog</title>
        <meta name="description" content="Se torne um contador global com a Globaliza Contabil" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </Head>

      {/* Hero Section */}
      <HeroSection />

      {/* Posts Carousel */}
      <PostsCarousel 
        title="Posts em Destaque"
        subtitle="Conteúdo exclusivo para sua carreira contábil internacional"
        posts={mockPosts}
      />

      {/* WhatsApp Banner */}
      <Box py={8}>
        <BannerWhatsApp />
      </Box>

      {/* Footer */}
      <Footer />
    </>
  )
} 