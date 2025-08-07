import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import 'antd/dist/reset.css'
import { AuthProvider } from '../contexts/AuthContext'
import { chakraTheme, cssVariables } from '../styles/colors'
import AntdConfigProvider from '../components/AntdConfigProvider'

// Estender o tema do Chakra UI com nossas cores
const theme = extendTheme({
  colors: chakraTheme.colors,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Globaliza Contabil</title>
        <meta name="description" content="Blog sobre contabilidade, impostos e legislação" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <style>{cssVariables}</style>
      </Head>

      <AuthProvider>
        <AntdConfigProvider>
          <ChakraProvider theme={theme}>
            <Component {...pageProps} />
          </ChakraProvider>
        </AntdConfigProvider>
      </AuthProvider>
    </>
  )
} 