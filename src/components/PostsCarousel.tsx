import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Button,
  Card,
  CardBody,
  Image,
  Badge,
  VStack,
  HStack,
  IconButton,
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { FiCalendar, FiUser, FiTag } from 'react-icons/fi'

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
      <Box py={16} bg="gray.50">
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
    <Box py={16} bg="gray.50">
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading 
              size="2xl" 
              color="primary.500" 
              mb={4}
              fontWeight="bold"
            >
              {title}
            </Heading>
            <Text 
              color="gray.600" 
              fontSize="lg"
              maxW="2xl"
              mx="auto"
            >
              {subtitle}
            </Text>
          </Box>

          {/* Carousel */}
          <Box position="relative">
            <Flex
              gap={6}
              overflow="hidden"
              position="relative"
              minH="400px"
            >
              {posts.slice(currentIndex, currentIndex + 3).map((post, index) => (
                <Card
                  key={post.id}
                  flex="1"
                  minW="350px"
                  shadow="lg"
                  borderRadius="xl"
                  overflow="hidden"
                  transition="all 0.3s"
                  _hover={{
                    transform: 'translateY(-8px)',
                    shadow: '2xl',
                  }}
                >
                  <Box position="relative">
                    {post.featured_image ? (
                      <Image
                        src={post.featured_image}
                        alt={post.title}
                        w="100%"
                        h="200px"
                        objectFit="cover"
                      />
                    ) : (
                      <Box
                        w="100%"
                        h="200px"
                        bg="primary.100"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text color="primary.500" fontSize="lg">
                          Sem imagem
                        </Text>
                      </Box>
                    )}
                    
                    <Badge
                      position="absolute"
                      top={4}
                      left={4}
                      colorScheme="primary"
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      {post.category.name}
                    </Badge>
                  </Box>

                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <Heading 
                        size="md" 
                        color="gray.800"
                        lineHeight="1.4"
                        noOfLines={2}
                      >
                        {post.title}
                      </Heading>
                      
                      <Text 
                        color="gray.600" 
                        fontSize="sm"
                        noOfLines={3}
                        lineHeight="1.6"
                      >
                        {post.excerpt}
                      </Text>

                      <HStack spacing={4} color="gray.500" fontSize="sm">
                        <HStack spacing={1}>
                          <FiCalendar size={14} />
                          <Text>{formatDate(post.published_at)}</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <FiUser size={14} />
                          <Text>{post.author.name}</Text>
                        </HStack>
                      </HStack>

                      <Button
                        colorScheme="primary"
                        variant="outline"
                        size="sm"
                        mt={2}
                        _hover={{
                          bg: 'primary.500',
                          color: 'white',
                        }}
                      >
                        Ler mais
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </Flex>

            {/* Navigation Buttons */}
            {posts.length > 3 && (
              <>
                <IconButton
                  aria-label="Post anterior"
                  icon={<ChevronLeftIcon />}
                  position="absolute"
                  left={-4}
                  top="50%"
                  transform="translateY(-50%)"
                  colorScheme="primary"
                  borderRadius="full"
                  onClick={prevSlide}
                  zIndex={2}
                />
                <IconButton
                  aria-label="Próximo post"
                  icon={<ChevronRightIcon />}
                  position="absolute"
                  right={-4}
                  top="50%"
                  transform="translateY(-50%)"
                  colorScheme="primary"
                  borderRadius="full"
                  onClick={nextSlide}
                  zIndex={2}
                />
              </>
            )}
          </Box>

          {/* View All Button */}
          <Box textAlign="center" pt={8}>
            <Button
              colorScheme="primary"
              size="lg"
              px={8}
              py={4}
              borderRadius="full"
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'lg',
              }}
            >
              Ver todos os posts
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
} 