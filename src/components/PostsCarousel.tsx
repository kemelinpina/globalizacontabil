import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Badge,
  IconButton,
  Flex,
  Icon,
  Link,
  useBreakpointValue,
  Skeleton,
  VStack,
} from '@chakra-ui/react'
import { FiCalendar, FiArrowUpRight } from 'react-icons/fi'
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa'

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

interface PostsCarouselProps {
  title?: string
  subtitle?: string
  posts?: Post[]
}

export default function PostsCarousel({
  title = "A jornada para uma certificação internacional parece um labirinto?",
  subtitle = "Conteúdo exclusivo para sua carreira contábil",
  posts: propPosts
}: PostsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true)

        console.log('🔍 Buscando posts...')

        // Buscar todos os posts publicados
        const response = await fetch('/api/pg/posts?status=published&limit=20')
        const data = await response.json()

        console.log('📊 Posts encontrados:', data)

        const publishedPosts = data.posts || []

        if (publishedPosts.length > 0) {
          console.log('✅ Posts carregados:', publishedPosts.length)
          setPosts(publishedPosts)

          // Definir o primeiro post como destaque
          setFeaturedPost(publishedPosts[0])
        } else {
          console.log('❌ Nenhum post encontrado')
        }
      } catch (error) {
        console.error('❌ Erro ao buscar posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Se posts foram passados como prop, usar eles
    if (propPosts && propPosts.length > 0) {
      console.log('📥 Usando posts das props:', propPosts.length)
      setPosts(propPosts)
      setFeaturedPost(propPosts[0])
      setIsLoading(false)
    } else {
      // Caso contrário, buscar do banco
      fetchPosts()
    }
  }, [propPosts])

  const nextSlide = () => {
    if (posts.length <= 3) return
    setCurrentIndex((prevIndex) =>
      prevIndex >= posts.length - 3 ? 0 : prevIndex + 1
    )
  }

  const prevSlide = () => {
    if (posts.length <= 3) return
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? posts.length - 3 : prevIndex - 1
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  const isMobile = useBreakpointValue({ base: true, md: false })

  if (isLoading) {
    return (
      <Box py={16} bg="#fafafa">
        <Container maxW="container.xl">
          <VStack spacing={3} align="stretch" w="full">
            {/* Skeleton para 4 itens de menu */}
            {[1, 2, 3, 4].map((item) => (
              <Box key={item}>
                <Skeleton height="20px" width="100%" />
              </Box>
            ))}
          </VStack>
        </Container>
      </Box>
    )
  }

  if (posts.length === 0) {
    return null
  }

  // Pegar os posts para o carrossel (excluindo o primeiro que é o destaque)
  const carouselPosts = posts.slice(1).slice(currentIndex, currentIndex + 3)

  return (
    <Box mt={'-60px'} bg="#fafafa">
      <Container maxW="container.xl" display={isMobile ? 'block' : 'flex'} gap={4} alignItems='flex-end' mt={isMobile ? 10 : 0}>
        {/* Post Destaque no Carousel */}
        <Box
          id='card-destaque'
          position='relative'
          w={isMobile ? '100%' : '25%'}
          bgImage={'/img-card-destaque.png'}
          bgSize='cover'
          bgPosition='center'
          bgRepeat='no-repeat'
          minH={'357px'}
          borderRadius="4px"
          mb={isMobile ? 10 : 0}
        >
          <Box w='100%' borderRadius='4px' h="100%" display="flex" flexDirection="column" justifyContent="space-between">
            <Box p={4}>
              <Heading as='h2' fontSize='2xl' fontWeight='600' textAlign='left' color='red.500' mb={2}>
                {featuredPost?.title || "Em breve..."}
              </Heading>
              <Text color='primary.500'>
                {featuredPost?.excerpt || "Novo post sendo preparado para você."}
              </Text>
              <Flex gap={3} mt={2}>
                <Badge
                  borderRadius='4px'
                  backgroundColor={'#FEDDDD'}
                  color='red.500'
                  fontWeight='600'
                  fontStyle='italic'
                >
                  {featuredPost?.category?.name || " "}
                </Badge>
                <Badge
                  borderRadius='4px'
                  backgroundColor={'#FEDDDD'}
                  color='red.500'
                  fontWeight='600'
                  fontStyle='italic'
                >
                  <Icon as={FiCalendar} mr={1} />
                  {featuredPost?.published_at ? formatDate(featuredPost.published_at) : " "}
                </Badge>
              </Flex>
            </Box>

            <IconButton
              alignSelf="flex-end"
              aria-label='Abrir Post'
              icon={<FiArrowUpRight />}
              color='red.500'
              backgroundColor='white'
              size='lg'
              fontSize='2xl'
              position='absolute'
              bottom={0}
              right={0}
              borderRadius='4px'
              onClick={() => {
                if (featuredPost) {
                  window.location.href = `/post/${featuredPost.slug}`
                }
              }}
              _hover={{ transform: 'translateY(-10px)' }}
            />
          </Box>
        </Box>
        <Box w={isMobile ? '100%' : '75%'} h='100%'>
          <Flex w='100%' justifyContent='space-between' alignItems='center' gap={4} flexDirection={isMobile ? 'column-reverse' : 'row'}>
            <Heading as='h2' fontSize={isMobile ? '2xl' : '3xl'} fontWeight='bold' textAlign='left' color='primary.500' mb={2} flex={1}>
              {title}
            </Heading>
            {/* Setas de navegação */}
            <Flex w={isMobile ? '100%' : 'auto'} gap={2} alignItems='center' justifyContent={isMobile ? 'flex-end' : 'flex-end'} mt={isMobile ? 10 : 0}>
              <IconButton
                aria-label='Voltar'
                icon={<FaCaretLeft />}
                borderRadius='4px'
                color='#0876D0'
                backgroundColor='white'
                fontSize='2xl'
                onClick={prevSlide}
                isDisabled={posts.length <= 3}
                _hover={{ backgroundColor: '#f0f0f0' }}
              >
              </IconButton>
              <IconButton
                aria-label='Avançar'
                icon={<FaCaretRight />}
                borderRadius='4px'
                color='#0876D0'
                backgroundColor='white'
                fontSize='2xl'
                onClick={nextSlide}
                isDisabled={posts.length <= 3}
                _hover={{ backgroundColor: '#f0f0f0' }}
              >
              </IconButton>
            </Flex>
          </Flex>
          <Flex w='100%' mt={4} gap={4} flexDirection={isMobile ? 'column' : 'row'}>
            {/* Outros posts */}
            {carouselPosts.map((post, index) => (
              <Box key={post.id} p={4} borderRadius='4px' bg='white' flex={1}>
                <Heading as='h3' fontSize='18px' fontWeight='bold' textAlign='left' color='primary.500' mb={2}>
                  {post.title}
                </Heading>
                <Text mb={4} color='primary.500' noOfLines={3}>
                  {post.excerpt}
                </Text>
                <Link
                  href={`/post/${post.slug}`}
                  color='red.500'
                  fontWeight='bold'
                  fontSize='12px'
                  mt={4}
                  _hover={{ textDecoration: 'none' }}
                >
                  Continue lendo
                </Link>
              </Box>
            ))}

            {/* Preencher espaços vazios se não houver posts suficientes */}
            {carouselPosts.length < 3 && Array.from({ length: 3 - carouselPosts.length }).map((_, index) => (
              <Box key={`empty-${index}`} p={4} borderRadius='4px' bg='white' flex={1} opacity={0.5}>
                <Heading as='h3' fontSize='18px' fontWeight='bold' textAlign='left' color='primary.500' mb={2}>
                  Em breve...
                </Heading>
                <Text mb={4} color='primary.500'>
                  Novos posts estão sendo preparados para você.
                </Text>
              </Box>
            ))}
          </Flex>
        </Box>
      </Container>
    </Box>
  )
} 