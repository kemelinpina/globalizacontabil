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
  posts: Post[]
}

export default function PostsCarousel({
  title = "Posts em Destaque",
  subtitle = "Conteúdo exclusivo para sua carreira contábil",
  posts
}: PostsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (posts.length > 0) {
      setIsLoading(false)
    }
  }, [posts])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === posts.length - 3 ? 0 : prevIndex + 1
    )
  }

  const prevSlide = () => {
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

  if (isLoading) {
    return (
      <Box py={16} bg="#fafafa">
        <Container maxW="container.xl">
          <Text>Carregando posts...</Text>
        </Container>
      </Box>
    )
  }

  if (posts.length === 0) {
    return null
  }

  return (
    <Box mt={'-60px'} bg="#fafafa">
      <Container maxW="container.xl" display="flex" gap={4} alignItems='flex-end'>
        {/* Post Destaque no Carousel */}
        <Box
          id='card-destaque'
          position='relative'
          w='25%'
          bgImage={'/img-card-destaque.png'}
          bgSize='cover'
          bgPosition='center'
          bgRepeat='no-repeat'
          minH={'357px'}
          borderRadius="4px"
        >
          <Box w='100%' borderRadius='4px' h="100%" display="flex" flexDirection="column" justifyContent="space-between">
            <Box p={4}>
              <Heading as='h2' fontSize='2xl' fontWeight='600' textAlign='left' color='red.500' mb={2}>
                O que é a Certificação CPA?
              </Heading>
              <Text color='primary.500'>
                Você sonha com uma carreira global em contabilidade, mas a sigla CPA parece um mistério? Muitos profissionais brasileiros ouvem falar dessa certificação, mas poucos realmente entendem seu poder e o caminho para conquistá-la.
              </Text>
              <Flex gap={3} mt={2}>
                <Badge
                  borderRadius='4px'
                  backgroundColor={'#FEDDDD'}
                  color='red.500'
                  fontWeight='600'
                  fontStyle='italic'
                >Certificações</Badge>
                <Badge
                  borderRadius='4px'
                  backgroundColor={'#FEDDDD'}
                  color='red.500'
                  fontWeight='600'
                  fontStyle='italic'
                ><Icon as={FiCalendar} mr={1} />Teste</Badge>
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
              borderRadius='4px'
              onClick={() => { }}
            />
          </Box>
        </Box>
        <Box w='75%' h='100%'>
          <Flex w='100%'>
            <Heading as='h2' fontSize='3xl' fontWeight='bold' textAlign='left' color='primary.500' mb={2}>
              A jornada para uma certificação internacional parece um labirinto?
            </Heading>
            {/* Setas de navegação */}
            <Flex w='25%' id='setas-posts' gap={2} justifyContent='flex-end' alignItems='center'>
              <IconButton
                aria-label='Voltar'
                icon={<FaCaretLeft />}
                borderRadius='4px'
                color='#0876D0'
                backgroundColor='white'
                fontSize='2xl'
              >
              </IconButton>
              <IconButton
                aria-label='Avançar'
                icon={<FaCaretRight />}
                borderRadius='4px'
                color='#0876D0'
                backgroundColor='white'
                fontSize='2xl'
              >
              </IconButton>
            </Flex>
          </Flex>
          <Flex w='100%' mt={4} gap={4}>
            {/* Outros posts */}
            <Box p={4} borderRadius='4px' bg='white'>
              <Heading as='h3' fontSize='18px' fontWeight='bold' textAlign='left' color='primary.500' mb={2}>
                Título do Post
              </Heading>
              <Text mb={4} color='primary.500'>Inseguro sobre como validar seu diploma brasileiro no exterior?</Text>
              <Link href='/post/1' color='red.500' fontWeight='bold' fontSize='12px' mt={4} _hover={{ textDecoration: 'none' }}>Continue lendo</Link>

            </Box>
            <Box p={4} borderRadius='4px' bg='white'>
              <Heading as='h3' fontSize='18px' fontWeight='bold' textAlign='left' color='primary.500' mb={2}>
                Título do Post
              </Heading>
              <Text mb={4} color='primary.500'>Inseguro sobre como validar seu diploma brasileiro no exterior?</Text>
              <Link href='/post/1' color='red.500' fontWeight='bold' fontSize='12px' mt={4} _hover={{ textDecoration: 'none' }}>Continue lendo</Link>

            </Box>
            <Box p={4} borderRadius='4px' bg='white'>
              <Heading as='h3' fontSize='18px' fontWeight='bold' textAlign='left' color='primary.500' mb={2}>
                Título do Post
              </Heading>
              <Text mb={4} color='primary.500'>Inseguro sobre como validar seu diploma brasileiro no exterior?</Text>
              <Link href='/post/1' color='red.500' fontWeight='bold' fontSize='12px' mt={4} _hover={{ textDecoration: 'none' }}>Continue lendo</Link>

            </Box>
          </Flex>


        </Box>
      </Container>
    </Box>
  )
} 