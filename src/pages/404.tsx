import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Custom404() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Página não encontrada - Globaliza Contabil</title>
      </Head>

      <Box bg="#fafafa" minH="100vh" display="flex" alignItems="center">
        <Container maxW="container.xl" textAlign="center">
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
              colorScheme="blue"
              size="lg"
              onClick={() => router.push('/')}
            >
              Voltar para Home
            </Button>
          </VStack>
        </Container>
      </Box>
    </>
  )
}
