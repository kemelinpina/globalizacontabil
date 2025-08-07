import { Box, Flex, Heading, IconButton, Text } from '@chakra-ui/react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'


export default function Footer() {
    return (
        <>
            <Flex w='100%' gap={8} p={8}>
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
                    <Flex gap={4}>
                        {/* Botões de redes sociais */}
                        <IconButton
                            as={Link}
                            href='https://www.instagram.com/globalizacontabil/'
                            target='_blank'
                            aria-label='Instagram'
                            icon={<FaInstagram />}
                            color='#E82FA4'
                            fontSize='23px'
                        ></IconButton>
                        <IconButton
                            as={Link}
                            href='https://www.linkedin.com/company/globaliza-contabil/'
                            target='_blank'
                            aria-label='LinkedIn'
                            icon={<FaLinkedinIn />}
                            color='#0077B5'
                            fontSize='23px'
                        ></IconButton>
                        <IconButton
                            as={Link}
                            href='https://www.facebook.com/globalizacontabil/'
                            target='_blank'
                            aria-label='Whatsapp'
                            icon={<FaWhatsapp />}
                            color='#66CC33'
                            fontSize='23px'
                        ></IconButton>
                    </Flex>
                </Box>
            </Flex>
            <Flex w='100%' px={8} justifyContent='center'>
                <Text color='primary.500' mb={0}>© 2025 Globaliza Contabil. Todos os direitos reservados.</Text>
            </Flex>
        </>
    )
}