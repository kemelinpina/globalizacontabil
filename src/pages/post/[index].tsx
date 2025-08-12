import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import {
    Box,
    Container,
    Heading,
    Text,
    Badge,
    Flex,
    Icon,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
} from '@chakra-ui/react'
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'
import { ChevronRightIcon } from '@chakra-ui/icons'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import CloudinaryImage from '../../components/CloudinaryImage'

interface Post {
    id: number
    title: string
    slug: string
    content: string
    excerpt?: string
    status: string
    meta_title?: string
    meta_description?: string
    featured_image?: string
    published_at?: string
    reading_time?: number
    view_count: number
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

export default function PostPage() {
    const [post, setPost] = useState<Post | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const { index } = router.query

    useEffect(() => {
        const fetchPost = async () => {
            if (!index) return

            try {
                setLoading(true)
                // Buscar por slug primeiro
                const response = await fetch(`/api/pg/posts?slug=${index}&status=published`)
                const data = await response.json()

                if (data.posts && data.posts.length > 0) {
                    setPost(data.posts[0])
                } else {
                    // Se não encontrar por slug, tentar por ID
                    const idResponse = await fetch(`/api/pg/posts/${index}`)
                    const idData = await idResponse.json()

                    if (idData.post && idData.post.status === 'published') {
                        setPost(idData.post)
                    } else {
                        router.push('/404')
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar post:', error)
                router.push('/404')
            } finally {
                setLoading(false)
            }
        }

        fetchPost()
    }, [index, router])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <Box py={16} bg="#fafafa" minH="100vh">
                <Container maxW="container.xl">
                    <Text>Carregando post...</Text>
                </Container>
            </Box>
        )
    }

    if (!post) {
        return (
            <Box py={16} bg="#fafafa" minH="100vh">
                <Container maxW="container.xl">
                    <Text>Post não encontrado</Text>
                </Container>
            </Box>
        )
    }

    return (
        <>
            <Head>
                <title>{post.meta_title || post.title} - Globaliza Contabil</title>
                <meta name="description" content={post.meta_description || post.excerpt} />
                {post.meta_title && <meta property="og:title" content={post.meta_title} />}
                {post.meta_description && <meta property="og:description" content={post.meta_description} />}
                {post.featured_image && <meta property="og:image" content={post.featured_image} />}
            </Head>
            <Header />

            <Box
                w="100%"
                minH="250px"
                py={16}
                bg="transparent linear-gradient(110deg, #FAFAFA 0%, #FAFAFA 47%, #EBF6FF 75%, #EBF6FF 82%, #FAFAFA 96%, #FAFAFA 100%) 0% 0% no-repeat padding-box"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Container maxW="container.xl" py={8} alignItems="center" justifyContent="center" textAlign="center">
                    <Heading
                        as="h1"
                        size="2xl"
                        color="primary.500"
                        mb={4}
                        lineHeight="1.2"
                        textAlign="center"
                    >
                        {post.title}
                    </Heading>
                    {/* Breadcrumb */}
                    <Flex justifyContent="center" alignItems="center">
                        <Breadcrumb
                            spacing="8px"
                            separator={<ChevronRightIcon color="gray.500" />}
                            mb={6}
                            justifyContent="center"
                            alignItems="center"
                        >
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/" color="primary.500">
                                    Home
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/posts" color="primary.500">
                                    Posts
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color="gray.600">
                                    {post.title}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </Flex>
                    {/* Meta Info */}
                    <Flex
                        gap={6}
                        alignItems="center"
                        fontSize="sm"
                        flexWrap="wrap"
                        justifyContent="center"
                        color="primary.500"
                    >
                        <Flex alignItems="center" gap={2}>
                            <Icon as={FiUser} />
                            <Text>{post.author.name}</Text>
                        </Flex>

                        <Flex alignItems="center" gap={2}>
                            <Icon as={FiCalendar} />
                            <Text>{formatDate(post.published_at || '')}</Text>
                        </Flex>

                        {post.reading_time && (
                            <Flex alignItems="center" gap={2}>
                                <Icon as={FiClock} />
                                <Text>{post.reading_time} min de leitura</Text>
                            </Flex>
                        )}
                    </Flex>

                </Container>
            </Box>

            <Box bg="#fafafa" minH="100vh">
                <Container maxW="container.xl" py={8}>
                    {/* Post Content */}
                    <Box bg="white" borderRadius="8px" p={8} boxShadow="sm">
                        {/* Header */}
                        <Box mb={8}>
                            <Badge
                                colorScheme="red"
                                variant="subtle"
                                px={3}
                                py={1}
                                borderRadius="4px"
                                mb={4}
                            >
                                {post.category.name}
                            </Badge>


                        </Box>

                        {/* Featured Image */}
                        {post.featured_image && (
                            <Box mb={8}>
                                <CloudinaryImage
                                    src={post.featured_image}
                                    alt={post.title}
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

                        {/* Content */}
                        <Box
                            className="post-content"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                            sx={{
                                '& h1, & h2, & h3, & h4, & h5, & h6': {
                                    color: 'primary.500',
                                    fontWeight: 'bold',
                                    mb: 4,
                                    mt: 6
                                },
                                '& h1': { fontSize: '2xl' },
                                '& h2': { fontSize: 'xl' },
                                '& h3': { fontSize: 'lg' },
                                '& p': {
                                    mb: 4,
                                    lineHeight: '1.7',
                                    color: 'gray.700'
                                },
                                '& ul, & ol': {
                                    mb: 4,
                                    pl: 6
                                },
                                '& li': {
                                    mb: 2,
                                    lineHeight: '1.6'
                                },
                                '& blockquote': {
                                    borderLeft: '4px solid',
                                    borderColor: 'primary.500',
                                    pl: 4,
                                    py: 2,
                                    my: 6,
                                    bg: 'gray.50',
                                    fontStyle: 'italic'
                                },
                                '& img': {
                                    maxWidth: '100%',
                                    height: 'auto',
                                    borderRadius: '8px',
                                    my: 4
                                },
                                '& a': {
                                    color: 'primary.500',
                                    textDecoration: 'underline',
                                    '&:hover': {
                                        textDecoration: 'none'
                                    }
                                },
                                '& table': {
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    mb: 4
                                },
                                '& th, & td': {
                                    border: '1px solid',
                                    borderColor: 'gray.200',
                                    p: 2,
                                    textAlign: 'left'
                                },
                                '& th': {
                                    bg: 'gray.50',
                                    fontWeight: 'bold'
                                }
                            }}
                        />
                    </Box>
                </Container>
            </Box>
            <Footer />
        </>
    )
}
