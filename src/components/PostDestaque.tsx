import { useState, useEffect } from 'react'
import { Box, Heading, Text, Link, Container, Flex, Badge, Icon } from '@chakra-ui/react'
import Image from 'next/image'
import { FiCalendar } from 'react-icons/fi'
import dayjs from 'dayjs'

interface Post {
  id: number
  title: string
  content: string
  excerpt?: string
  slug: string
  featured_image?: string
  status: string
  is_featured: boolean
  published_at?: string
  category: {
    id: number
    name: string
    color: string
  }
  author: {
    id: number
    name: string
  }
}

export default function PostDestaque() {
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedPost = async () => {
      try {
        const response = await fetch('/api/pg/posts?status=published&is_featured=true&limit=1')
        const data = await response.json()
        
        if (data.posts && data.posts.length > 0) {
          setFeaturedPost(data.posts[0])
        }
      } catch (error) {
        console.error('Erro ao buscar post em destaque:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedPost()
  }, [])

  // Se não há post em destaque ou está carregando, não mostra nada
  if (loading || !featuredPost) {
    return null
  }

  return (
    <>
      <Box bg="#fafafa" mt={'60px'}>
        <Container maxW="container.xl" display="flex" borderRadius='4px' bg='white' p={4}>
          <Box 
            w='25%' 
            h='100%' 
            boxSize={'25%'} 
            minH={'357px'} 
            bgImage={featuredPost.featured_image || '/default.png'} 
            bgSize='cover' 
            bgPosition='center' 
            bgRepeat='no-repeat'
          >
          </Box>
          <Box w='75%' h='100%' p={4}>
            <Heading as='h3' fontSize='2xl' fontWeight='600' textAlign='left' color='red.500' mb={2}>
              {featuredPost.title}
            </Heading>
            <Text fontSize='14px' fontWeight='400' textAlign='left' color='primary.500' mb={2}>
              {featuredPost.excerpt || 'Inseguro sobre como validar seu diploma brasileiro no exterior?'}
            </Text>
            <Flex gap={3} mt={2} mb={4}>
              <Badge
                borderRadius='4px'
                backgroundColor={'#FEDDDD'}
                color='red.500'
                fontWeight='600'
                fontStyle='italic'
              >
                {featuredPost.category.name}
              </Badge>
              {featuredPost.published_at && (
                <Badge
                  borderRadius='4px'
                  backgroundColor={'#FEDDDD'}
                  color='red.500'
                  fontWeight='600'
                  fontStyle='italic'
                >
                  <Icon as={FiCalendar} mr={1} />
                  {dayjs(featuredPost.published_at).format('DD/MM/YYYY')}
                </Badge>
              )}
            </Flex>
            <Link 
              href={`/post/${featuredPost.slug}`} 
              color='red.500' 
              fontWeight='bold' 
              fontSize='12px' 
              mt={4} 
              _hover={{ textDecoration: 'none' }}
            >
              Continue lendo
            </Link>
          </Box>
        </Container>
      </Box>
    </>
  )
}