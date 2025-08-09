import { Box, Container, Flex } from '@chakra-ui/react'
import Image from 'next/image'
import NextLink from 'next/link'
import DynamicMenu from './DynamicMenu'
import DynamicContacts from './DynamicContacts'

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
            <DynamicContacts location="header" />
          </Flex>
        </Container>
      </Box>
    </>
  )
}