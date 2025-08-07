import React, { useState, useEffect, useCallback } from 'react'
import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Icon,
    Text,
    Input,
    InputGroup,
    InputLeftElement,
    VStack,
    HStack,
    Badge,
    Image,
    Spinner,
    Select,
    Card,
    CardBody,
    CardHeader,
} from '@chakra-ui/react'
import { FiSearch, FiCalendar, FiUser, FiEye, FiClock, FiMail } from 'react-icons/fi'
import Head from 'next/head'
import Header from '@/components/Header'
import Link from 'next/link'
import ImageNext from 'next/image'

interface Post {
    id: number
    title: string
    slug: string
    excerpt?: string
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

interface Category {
    id: number
    name: string
    color: string
    is_active: boolean
}

export default function Blog() {
    const [posts, setPosts] = useState<Post[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '6',
                status: 'published'
            })

            if (searchTerm.trim()) {
                params.append('search', searchTerm.trim())
            }

            if (selectedCategory) {
                params.append('category_id', selectedCategory)
            }

            const response = await fetch(`/api/pg/posts?${params}`)
            const data = await response.json()

            setPosts(data.posts || [])
            setTotalPages(data.pagination?.pages || 1)
        } catch (error) {
            console.error('❌ Erro ao buscar posts:', error)
        } finally {
            setLoading(false)
        }
    }, [currentPage, searchTerm, selectedCategory])

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch('/api/pg/categories')
            const data = await response.json()
            setCategories(data.categories || [])
        } catch (error) {
            console.error('❌ Erro ao buscar categorias:', error)
        }
    }, [])

    // Buscar posts
    useEffect(() => {
        fetchPosts()
    }, [fetchPosts])

    // Buscar categorias
    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        setCurrentPage(1)
    }

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value)
        setCurrentPage(1)
    }

    return (
        <>
            <Head>
                <title>Blog - Globaliza Contabil</title>
                <meta name="description" content="Conteúdo exclusivo para sua carreira contábil internacional" />
                <meta name="keywords" content="contabilidade, internacional, carreira, blog, posts" />
                <meta name="author" content="Globaliza Contabil" />
                <meta name="robots" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta property="og:title" content="Blog - Globaliza Contabil" />
                <meta property="og:description" content="Conteúdo exclusivo para sua carreira contábil internacional" />
                <meta property="og:image" content="default.png" />
                <meta property="og:url" content="https://www.globalizacontabil.com.br/blog" />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="pt-BR" />
                <meta property="og:site_name" content="Globaliza Contabil" />
            </Head>

            <Header />

            {/* Hero Section */}
            <Box
                w="100%"
                minH="260px"
                py={16}
                bg="transparent linear-gradient(110deg, #FAFAFA 0%, #FAFAFA 47%, #EBF6FF 75%, #EBF6FF 82%, #FAFAFA 96%, #FAFAFA 100%) 0% 0% no-repeat padding-box"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection='column'
            >
                <Heading
                    as="h1"
                    fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                    fontWeight="bold"
                    color="primary.500"
                    lineHeight="1.2"
                    textAlign="center"
                >
                    Conteúdo <Text as="span" color="red.500">Contabiliza Contábil</Text>
                </Heading>
                <Text
                    as='p'
                    color='primary.500'
                    fontSize="lg"
                    mt={4}
                    textAlign="center"
                >
                    O blog para quem quer ser contador internacional.
                </Text>
            </Box>

            {/* Main Content */}
            <Box my={10} color='primary.500'>
                <Container maxW="container.xl">
                    <Flex w='100%' gap={8} direction={{ base: 'column', lg: 'row' }}>
                        {/* Lista de posts */}
                        <Box w={{ base: '100%', lg: '75%' }}>
                            {/* Filtros */}
                            <Flex
                                gap={4}
                                mb={8}
                                direction={{ base: 'column', md: 'row' }}
                                alignItems={{ base: 'stretch', md: 'center' }}
                                justifyContent="space-between"
                            >
                                <InputGroup maxW="300px">
                                    <InputLeftElement pointerEvents='none'>
                                        <Icon as={FiSearch} color="gray.400" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Buscar posts..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        borderRadius="4px"
                                    />
                                </InputGroup>

                                <Select
                                    placeholder="Todas as categorias"
                                    value={selectedCategory}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    maxW="200px"
                                    borderRadius="4px"
                                >
                                    {categories
                                        .filter(cat => cat.is_active)
                                        .map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))
                                    }
                                </Select>
                            </Flex>

                            {/* Posts */}
                            {loading ? (
                                <Flex justify="center" py={10}>
                                    <Spinner size="lg" color="primary.500" />
                                </Flex>
                            ) : posts.length === 0 ? (
                                <Box display="flex" flexDirection="column" textAlign="center" py={10} justifyContent="center" alignItems="center">
                                    <ImageNext src="/empty-post.svg" alt="Nenhum post encontrado" width={200} height={200} />
                                    <Text fontSize="lg" color="primary.500">
                                        Nenhum post encontrado.
                                    </Text>
                                    {searchTerm && (
                                        <Text fontSize="sm" color="primary.500" mt={2}>
                                            Tente uma busca diferente ou remova os filtros.
                                        </Text>
                                    )}
                                </Box>
                            ) : (
                                <VStack spacing={6} align="stretch">
                                    {posts.map((post) => (
                                        <Card key={post.id} borderRadius="8px" boxShadow="sm">
                                            <CardBody>
                                                <Flex gap={6} direction={{ base: 'column', md: 'row' }}>
                                                    {/* Imagem */}
                                                    {post.featured_image && (
                                                        <Box
                                                            w={{ base: '100%', md: '200px' }}
                                                            h={{ base: '200px', md: '150px' }}
                                                            flexShrink={0}
                                                        >
                                                            <Image
                                                                src={post.featured_image}
                                                                alt={post.title}
                                                                w="100%"
                                                                h="100%"
                                                                objectFit="cover"
                                                                borderRadius="8px"
                                                            />
                                                        </Box>
                                                    )}

                                                    {/* Conteúdo */}
                                                    <Box flex={1}>

                                                        <Link href={`/post/${post.slug}`}>
                                                            <Heading
                                                                as="h2"
                                                                size="md"
                                                                color="primary.500"
                                                                mb={3}
                                                                cursor="pointer"
                                                                _hover={{ color: 'red.500' }}
                                                            >
                                                                {post.title}
                                                            </Heading>
                                                        </Link>

                                                        {post.excerpt && (
                                                            <Text color="gray.600" mb={4} lineHeight="1.6">
                                                                {post.excerpt}
                                                            </Text>
                                                        )}

                                                        {/* Categoria */}
                                                        <HStack mb={5}>
                                                            <Badge
                                                                colorScheme="red"
                                                                variant="subtle"
                                                                borderRadius="4px"
                                                                px={2}
                                                                py={1}
                                                            >
                                                                {post.category.name}
                                                            </Badge>
                                                        </HStack>

                                                        {/* Meta Info */}
                                                        <Flex
                                                            gap={4}
                                                            alignItems="center"
                                                            color="gray.500"
                                                            fontSize="sm"
                                                            flexWrap="wrap"
                                                        >
                                                            <Flex alignItems="center" gap={1}>
                                                                <Icon as={FiUser} />
                                                                <Text>{post.author.name}</Text>
                                                            </Flex>

                                                            <Flex alignItems="center" gap={1}>
                                                                <Icon as={FiCalendar} />
                                                                <Text>{formatDate(post.published_at || '')}</Text>
                                                            </Flex>

                                                            {post.reading_time && (
                                                                <Flex alignItems="center" gap={1}>
                                                                    <Icon as={FiClock} />
                                                                    <Text>{post.reading_time} min de leitura</Text>
                                                                </Flex>
                                                            )}

                                                            <Flex alignItems="center" gap={1}>
                                                                <Icon as={FiEye} />
                                                                <Text>{post.view_count || 0} visualizações</Text>
                                                            </Flex>
                                                        </Flex>
                                                    </Box>
                                                </Flex>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </VStack>
                            )}

                            {/* Paginação */}
                            {totalPages > 1 && (
                                <Flex justify="center" mt={8}>
                                    <HStack spacing={2}>
                                        <Button
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            size="sm"
                                            variant="outline"
                                        >
                                            Anterior
                                        </Button>

                                        <Text>
                                            Página {currentPage} de {totalPages}
                                        </Text>

                                        <Button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            size="sm"
                                            variant="outline"
                                        >
                                            Próxima
                                        </Button>
                                    </HStack>
                                </Flex>
                            )}
                        </Box>

                        {/* Sidebar */}
                        <Box w={{ base: '100%', lg: '25%' }}>
                            <VStack spacing={6} align="stretch">
                                {/* Campo de busca */}
                                <Card borderRadius="8px" boxShadow="sm">
                                    <CardHeader>
                                        <Heading size="sm" color="primary.500">
                                            Buscar Posts
                                        </Heading>
                                    </CardHeader>
                                    <CardBody>
                                        <InputGroup>
                                            <InputLeftElement pointerEvents='none'>
                                                <Icon as={FiSearch} color="gray.400" />
                                            </InputLeftElement>
                                            <Input
                                                placeholder="Digite sua busca..."
                                                value={searchTerm}
                                                onChange={(e) => handleSearch(e.target.value)}
                                                borderRadius="4px"
                                            />
                                        </InputGroup>
                                    </CardBody>
                                </Card>

                                {/* Categorias */}
                                <Card borderRadius="8px" boxShadow="sm">
                                    <CardHeader>
                                        <Heading size="sm" color="primary.500">
                                            Categorias
                                        </Heading>
                                    </CardHeader>
                                    <CardBody>
                                        <VStack spacing={2} align="stretch">
                                            <Button
                                                variant={selectedCategory === '' ? 'solid' : 'ghost'}
                                                colorScheme="red"
                                                size="sm"
                                                justifyContent="flex-start"
                                                onClick={() => handleCategoryChange('')}
                                            >
                                                Todas as categorias
                                            </Button>
                                            {categories
                                                .filter(cat => cat.is_active)
                                                .map(category => (
                                                    <Button
                                                        key={category.id}
                                                        variant={selectedCategory === category.id.toString() ? 'solid' : 'ghost'}
                                                        colorScheme="red"
                                                        size="sm"
                                                        justifyContent="flex-start"
                                                        onClick={() => handleCategoryChange(category.id.toString())}
                                                    >
                                                        {category.name}
                                                    </Button>
                                                ))
                                            }
                                        </VStack>
                                    </CardBody>
                                </Card>

                                {/* Banner de contato */}
                                <Card borderRadius="8px" boxShadow="sm" bg="red.500" color="white">
                                    <CardBody textAlign="center">
                                        <VStack spacing={4}>
                                            <Icon as={FiMail} boxSize={8} />
                                            <Heading size="md">
                                                Fale comigo
                                            </Heading>
                                            <Text fontSize="sm">
                                                Tem dúvidas sobre carreira internacional?
                                            </Text>
                                            <Button
                                                backgroundColor='white'
                                                color='red.500'
                                                size='md'
                                                borderRadius='4px'
                                                rightIcon={<Icon as={FiMail} />}
                                                onClick={() => window.open('mailto:contato@globalizacontabil.com.br', '_blank')}
                                                _hover={{
                                                    backgroundColor: 'gray.100',
                                                    transform: 'translateY(-2px)'
                                                }}
                                            >
                                                Enviar e-mail
                                            </Button>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            </VStack>
                        </Box>
                    </Flex>
                </Container>
            </Box>
        </>
    )
}