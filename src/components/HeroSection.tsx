import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  IconButton,
  Link,
} from '@chakra-ui/react'
import { FaInstagram, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa'

export default function HeroSection () {
  return (
    <>
      <Box
        w="100%"
        minH="480px"
        py={16}
        bg="transparent linear-gradient(110deg, #FAFAFA 0%, #FAFAFA 47%, #EBF6FF 75%, #EBF6FF 82%, #FAFAFA 96%, #FAFAFA 100%) 0% 0% no-repeat padding-box"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center">
            {/* Main Content */}
            <VStack spacing={6} maxW="4xl">
              <Heading
                as="h1"
                fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                fontWeight="bold"
                color="primary.500"
                lineHeight="1.2"
              >
                <Box
                  as="span"
                  color="primary.500"
                  display="inline-block"
                  mr={2}
                >
                  Desbloqueie
                </Box>
                <Box
                  as="span"
                  color="primary.500"
                  display="inline-block"
                  mr={2}
                >
                  sua
                </Box>
                <Box
                  as="span"
                  color="accent.500"
                  display="inline-block"
                  mr={2}
                >
                  Carreira
                </Box>
                <Box
                  as="span"
                  color="primary.500"
                  display="inline-block"
                  mr={2}
                >
                  Contábil
                </Box>
                <Box
                  as="span"
                  color="primary.500"
                  display="inline-block"
                  mr={2}
                >
                  Global
                </Box>
              </Heading>

              <Text
                as="p"
                color="primary.500"
                fontSize={{ base: "lg", md: "xl" }}
                maxW="3xl"
                lineHeight="1.6"
              >
                Seu conteúdo para as certificações CPA, ACCA, CIA e CMA. Ajudando você a se destacar na sua carreira internacional.
              </Text>
            </VStack>

            {/* CTA and Social Buttons */}
            <HStack spacing={6} justify="center">
              <Button
                colorScheme="primary"
                size="lg"
                px={8}
                py={4}
                fontSize="lg"
                fontWeight="semibold"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'lg',
                }}
                as={Link}
                href="/posts"
              >
                ACESSE NOSSO CONTEÚDO
              </Button>

              {/* Social Media Buttons */}
              <HStack spacing={4}>
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
              </HStack>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </>
  )
}
