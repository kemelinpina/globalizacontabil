import Layout1 from '@/components/layouts/layout1'
import { useRouter } from 'next/router'
import React from 'react'
import Head from 'next/head'
import { Box, Text } from '@chakra-ui/react'

export default function Page() {
    const router = useRouter()
    const { index } = router.query

    return (
        <Layout1>
            <Head>
                <title>Titulo da Página - {index}</title>
                <meta name="description" content="Descrição da página" />
                <meta name="keywords" content="palavras-chave, separadas, por, vírgula" />
                <meta name="author" content="Nome do autor" />
                <meta name="robots" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta property="og:title" content="Titulo da Página - {index}" />
                <meta property="og:description" content="Descrição da página" />
                <meta property="og:image" content="imagem desta página" />
                <meta property="og:url" content="https://www.globalizacontabil.com.br" />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="pt-BR" />
                <meta property="og:site_name" content="Globaliza Contabil" />
            </Head>
            <Box>
                <Text>
                    {index}
                </Text>
            </Box>
        </Layout1>
    )
}