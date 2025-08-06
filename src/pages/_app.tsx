import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import 'antd/dist/reset.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Globaliza Contabil</title>
        <meta name="description" content="Blog sobre contabilidade, impostos e legislação" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </Head>
      
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  )
} 