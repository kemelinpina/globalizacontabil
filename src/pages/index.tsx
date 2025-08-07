import React, { useState, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import Head from 'next/head'
import HeroSection from '@/components/HeroSection'
import PostsCarousel from '../components/PostsCarousel'
import BannerWhatsApp from '../components/BannerWhatsApp'
import Footer from '../components/Footer'

interface Post {
  id: number
  title: string
  excerpt: string
  featured_image?: string
  slug: string
  published_at: string
  author: {
    name: string
  }
  category: {
    name: string
  }
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/pg/posts?status=published&limit=6')
        const data = await response.json()
        setPosts(data.posts || [])
      } catch (error) {
        console.error('Erro ao buscar posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

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
        posts={posts}
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