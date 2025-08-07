import { Box, Button, Container, Flex, Heading, Icon, Text } from '@chakra-ui/react'
import React from 'react'
import dayjs from 'dayjs'
import Head from 'next/head'
import Header from '@/components/Header'
import { TbMailShare } from 'react-icons/tb'

export default function Blog() {
    return (
        <>
            <Head>
                <title>Blog - Globaliza Contabil</title>
                <meta name="description" content="Descrição do blog" />
                <meta name="keywords" content="palavras-chave, separadas, por, vírgula" />
                <meta name="author" content="Nome do autor" />
                <meta name="robots" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta property="og:title" content="Blog - Globaliza Contabil" />
                <meta property="og:description" content="Descrição do blog" />
                <meta property="og:image" content="default.png" />
                <meta property="og:url" content="https://www.globalizacontabil.com.br" />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="pt-BR" />
                <meta property="og:site_name" content="Globaliza Contabil" />
            </Head>
            <Header />
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
                >
                    Conteúdo <Text as="span" color="red.500">Contabiliza Contábil</Text>
                </Heading>
                <Text as='p' color='primary.500'>O blog para quem quer ser contador internacional.</Text>
            </Box>
            <Box my={10} color='primary.500'>
                <Container maxW="container.xl">
                    <Flex w='100%'>
                        {/* Lista de posts */}
                        <Box w='75%'>
                            <Text>
                                Conteúdo do blog aqui lista de posts com páginação.
                            </Text>
                        </Box>
                        {/* Sidebar */}
                        <Box w='25%'>
                            <Text>
                                Campo de busca.
                                Banner carrossel de anuncio.
                            </Text>
                            <Button
                                backgroundColor='red.500'
                                color='white'
                                size='md'
                                borderRadius='4px'
                                mt={2}
                                rightIcon={<Icon as={TbMailShare} />}
                                onClick={() => { }}
                                _hover={{
                                    backgroundColor: 'red.600',
                                    textDecoration: 'none',
                                    transform: 'translateY(-10px)'
                                }}
                            >
                                Fale comigo por e-mail
                            </Button>
                        </Box>
                    </Flex>
                </Container>
            </Box>
        </>
    )
}