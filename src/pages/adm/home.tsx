import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Button
} from '@chakra-ui/react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const router = useRouter()
  const bgColor = 'white'

  return (
    <>
      <Head>
        <title>Dashboard - Globaliza Contabil</title>
      </Head>
      
      <Box minH="100vh" bg="gray.50">
        <Container maxW="container.xl" py={8}>
          <VStack gap={8} align="stretch">
            {/* Header */}
            <Box>
              <Heading size="lg" color="blue.600">
                Dashboard
              </Heading>
              <Text color="gray.600">
                Bem-vindo ao painel administrativo
              </Text>
            </Box>

            {/* Stats */}
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
              <Stat
                px={4}
                py={5}
                bg={bgColor}
                shadow="base"
                rounded="lg"
              >
                <StatLabel>Total de Posts</StatLabel>
                <StatNumber>0</StatNumber>
                <StatHelpText>Artigos publicados</StatHelpText>
              </Stat>

              <Stat
                px={4}
                py={5}
                bg={bgColor}
                shadow="base"
                rounded="lg"
              >
                <StatLabel>Categorias</StatLabel>
                <StatNumber>0</StatNumber>
                <StatHelpText>Categorias criadas</StatHelpText>
              </Stat>

              <Stat
                px={4}
                py={5}
                bg={bgColor}
                shadow="base"
                rounded="lg"
              >
                <StatLabel>Visualizações</StatLabel>
                <StatNumber>0</StatNumber>
                <StatHelpText>Total de visualizações</StatHelpText>
              </Stat>
            </SimpleGrid>

            {/* Quick Actions */}
            <Box bg={bgColor} p={6} rounded="lg" shadow="base">
              <Heading size="md" mb={4}>
                Ações Rápidas
              </Heading>
              
              <HStack gap={4} flexWrap="wrap">
                <Button colorScheme="blue" size="sm">
                  Novo Post
                </Button>
                <Button colorScheme="green" size="sm">
                  Nova Categoria
                </Button>
                <Button colorScheme="purple" size="sm">
                  Gerenciar Usuários
                </Button>
                <Button 
                  colorScheme="red" 
                  size="sm"
                  onClick={() => router.push('/adm')}
                >
                  Sair
                </Button>
              </HStack>
            </Box>

            {/* Recent Posts */}
            <Box bg={bgColor} p={6} rounded="lg" shadow="base">
              <Heading size="md" mb={4}>
                Posts Recentes
              </Heading>
              
              <Text color="gray.500" textAlign="center" py={8}>
                Nenhum post criado ainda.
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  )
} 