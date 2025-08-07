import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Flex,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import ImageNext from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Custom404() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Página não encontrada - Globaliza Contabil</title>
      </Head>
      <Header />

      <Box bg="#fafafa" minH="100vh" display="flex" alignItems="center">
        <Container maxW="container.xl" textAlign="center">
          <Flex justifyContent="center" alignItems="center">
            <ImageNext src="/404.svg" alt="Página não encontrada" width={200} height={200} />
          </Flex>
          <VStack spacing={8}>
            <Heading
              as="h1"
              size="4xl"
              color="primary.500"
              fontWeight="bold"
            >
              404
            </Heading>
            
            <Heading
              as="h2"
              size="lg"
              color="gray.600"
              fontWeight="normal"
            >
              Página não encontrada
            </Heading>
            
            <Text
              fontSize="lg"
              color="gray.500"
              maxW="md"
            >
              A página que você está procurando não existe ou foi movida.
            </Text>
            
            <Button
              bg="primary.500"
              borderRadius="4px"
              color="white"
              size="lg"
              _hover={{
                bg: "primary.600",
              }}
              onClick={() => router.push('/')}
            >
              Voltar para Home
            </Button>
          </VStack>
        </Container>
      </Box>
      <Footer />
    </>
  )
}
