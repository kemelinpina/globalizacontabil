import { Box, Container } from '@chakra-ui/react'
import React from 'react'
import Header from '../Header'
import Footer from '../Footer'

export default function Layout1({ children }: { children: React.ReactNode }) {
    return (
        <Box>
            <Header />
            <Box
                w="100%"
                minH="480px"
                py={16}
                bg="transparent linear-gradient(110deg, #FAFAFA 0%, #FAFAFA 47%, #EBF6FF 75%, #EBF6FF 82%, #FAFAFA 96%, #FAFAFA 100%) 0% 0% no-repeat padding-box"
                display="flex"
                alignItems="center"
                justifyContent="center"
            ></Box>
            <Container maxW="container.xl" p={0}>
                {children}
            </Container>
            <Footer />
        </Box>
    )
}