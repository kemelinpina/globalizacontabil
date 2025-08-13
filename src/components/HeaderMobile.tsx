// src/components/HeaderMobile.tsx
import React from 'react'
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  VStack,
  Text,
  useDisclosure,
  useBreakpointValue,
  Flex,
  Divider
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import Image from 'next/image'
import NextLink from 'next/link'
import DynamicContacts from './DynamicContacts'
import DynamicMenuMobile from './DynamicMenuMobile'

export default function HeaderMobile() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Só renderiza em dispositivos móveis
  if (!isMobile) {
    return null
  }

  return (
    <>
      {/* Botão do menu hambúrguer */}
      <IconButton
        aria-label="Abrir menu"
        icon={<HamburgerIcon />}
        onClick={onOpen}
        variant="ghost"
        size="md"
        color="primary.500"
        _hover={{ bg: 'gray.100' }}
      />

      {/* Drawer do menu mobile */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton size="lg" color="primary.500" />

          <DrawerHeader borderBottomWidth="1px" pb={4}>
            <Box as={NextLink} href="/" onClick={onClose}>
              <Image
                src="/logo-globaliza.svg"
                alt="Globaliza Contabil"
                width={180}
                height={120}
              />
            </Box>
          </DrawerHeader>

          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch" h="100%">
              {/* Seção do Menu */}
              <Box p={6} flex="1">
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color="primary.500"
                  mb={4}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Menu
                </Text>

                {/* Menu customizado para mobile */}
                <Box className="mobile-menu">
                  <DynamicMenuMobile location="header" />
                </Box>
              </Box>

              <Divider />

              {/* Seção dos Contatos */}
              <Box p={6} bg="gray.50">
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color="primary.500"
                  mb={4}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Contatos
                </Text>

                <Flex justify="center" wrap="wrap" gap={3}>
                  <DynamicContacts location="header" />
                </Flex>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
