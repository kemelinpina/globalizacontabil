import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react'
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Globaliza Contabil - Blog</title>
        <meta name="description" content="Blog sobre contabilidade, impostos e legislação" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Box as="main" minH="100vh" bg="gray.50">
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} textAlign="center">
            <Heading as="h1" size="2xl" color="blue.600">
              Globaliza Contabil
            </Heading>
            
            <Text fontSize="xl" color="gray.600">
              Blog sobre contabilidade, impostos e legislação
            </Text>
            
            <Box 
              p={8} 
              bg="white" 
              borderRadius="lg" 
              boxShadow="md"
              w="full"
            >
              <Text fontSize="lg" color="gray.700">
                Bem-vindo ao blog da Globaliza Contabil! 
                Aqui você encontrará artigos sobre contabilidade, 
                impostos, legislação e muito mais.
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  )
} 