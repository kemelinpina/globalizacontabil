import { Box, Container, Flex, useBreakpointValue } from '@chakra-ui/react'
import Image from 'next/image'
import NextLink from 'next/link'
import DynamicMenu from './DynamicMenu'
import DynamicContacts from './DynamicContacts'
import HeaderMobile from './HeaderMobile'

export default function Header() {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <>
      <Box bg='transparent'>
        <Container maxW="container.xl">
          <Flex w='100%' justifyContent='space-between' alignItems='center' py={4}>
            <Box as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
              <Image src="/logo-globaliza.svg" alt="Globaliza Contabil" width={160} height={100} />
            </Box>
            
            {/* Menu desktop - só aparece em telas maiores */}
            {!isMobile && (
              <Box>
                <DynamicMenu location="header" />
              </Box>
            )}
            
            {/* Contatos desktop - só aparecem em telas maiores */}
            {!isMobile && (
              <DynamicContacts location="header" />
            )}
            
            {/* Header Mobile - só aparece em dispositivos móveis */}
            <HeaderMobile />
          </Flex>
        </Container>
      </Box>
    </>
  )
}