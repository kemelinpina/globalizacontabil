import { Box, Container, Flex, Heading, Text } from '@chakra-ui/react'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import dayjs from 'dayjs'
import DynamicContacts from './DynamicContacts'


export default function Footer() {
    const currentYear = dayjs().year();
    return (
        <>
            <Box bg="#fafafa" mt={'60px'}>
                <Container maxW="container.xl" p={0}>
                    <Flex w='100%' gap={8}>
                        <Box w='25%'>
                            <Image src="/logo-globaliza.svg" alt="Globaliza Contabil" width={160} height={100} />
                            <Text>Inseguro sobre como validar seu diploma brasileiro no exterior?</Text>
                        </Box>
                        <Box w='25%' display='flex' flexDirection='column' gap={2} color='primary.500'>
                            <Heading as='h5' fontSize='1xl' fontWeight='bold' color='primary.500'>Links Úteis</Heading>
                            <Link href="/">Home</Link>
                            <Link href="/">Sobre</Link>
                            <Link href="/">Contato</Link>
                        </Box>
                        <Box w='25%' display='flex' flexDirection='column' gap={2} color='primary.500'>
                            <Heading as='h5' fontSize='1xl' fontWeight='bold' color='primary.500'>Links Úteis</Heading>
                            <Link href="/">Home</Link>
                            <Link href="/">Sobre</Link>
                            <Link href="/">Contato</Link>
                        </Box>
                        <Box w='25%'>
                            <Heading as='h5' fontSize='1xl' fontWeight='bold' color='primary.500'>Redes Sociais</Heading>
                            <DynamicContacts location="footer" />
                        </Box>
                    </Flex>
                    <Flex w='100%' px={8} justifyContent='center' mt={10} mb={4}>
                        <Text color='primary.500' mb={0}>© {currentYear} Globaliza Contabil. Todos os direitos reservados. <Link href="https://3hub.com.br" target='_blank'>3Hub.</Link></Text>
                    </Flex>
                </Container>
            </Box>
        </>
    )
}