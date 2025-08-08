import { Box, Container, Flex, IconButton, Link } from '@chakra-ui/react'
import Image from 'next/image'
import NextLink from 'next/link'
import DynamicMenu from './DynamicMenu'
import { FaInstagram, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa'

export default function Header() {

  return (
    <>
      <Box bg='transparent'>
        <Container maxW="container.xl">
          <Flex w='100%' justifyContent='space-between' alignItems='center' py={4}>
            <Box as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
              <Image src="/logo-globaliza.svg" alt="Globaliza Contabil" width={160} height={100} />
            </Box>
            <Box>
              <DynamicMenu location="header" />
            </Box>
            <Flex gap={4} justifyContent='flex-end' alignItems='center'>
              <IconButton
                as={Link}
                href="https://www.instagram.com/globalizacontabil/"
                target="_blank"
                aria-label="Instagram"
                icon={<FaInstagram />}
                color="#E82FA4"
                fontSize="23px"
                size="md"
                variant="ghost"
                bg="white"
                _hover={{
                  bg: 'white',
                  transform: 'translateY(-15px)',
                }}
              />
              <IconButton
                as={Link}
                href="https://www.linkedin.com/company/globaliza-contabil/"
                target="_blank"
                aria-label="LinkedIn"
                icon={<FaLinkedinIn />}
                color="#0077B5"
                fontSize="23px"
                size="md"
                variant="ghost"
                bg="white"
                _hover={{
                  bg: 'white',
                  transform: 'translateY(-15px)',
                }}
              />
              <IconButton
                as={Link}
                href="https://wa.me/5511999999999"
                target="_blank"
                aria-label="WhatsApp"
                icon={<FaWhatsapp />}
                color="#66CC33"
                fontSize="23px"
                size="md"
                variant="ghost"
                bg="white"
                _hover={{
                  bg: 'white',
                  transform: 'translateY(-15px)',
                }}
              />
            </Flex>
          </Flex>
        </Container>
      </Box>
    </>
  )
}