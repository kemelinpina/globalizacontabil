import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Link,
  useBreakpointValue,
} from '@chakra-ui/react'
import DynamicContacts from './DynamicContacts'

export default function HeroSection () {
  const isMobile = useBreakpointValue({ base: true, md: false })
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
                  color="primary.500"
                  display="inline-block"
                  mr={2}
                >
                  Carreira
                </Box>
                <Box
                  as="span"
                  color="accent.500"
                  display="inline-block"
                  mr={2}
                >
                  Contábil
                </Box>
                <Box
                  as="span"
                  color="accent.500"
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
            <HStack spacing={6} justify="center" display={isMobile ? 'block' : 'flex'}>
              <Button
                colorScheme="primary"
                size="lg"
                px={8}
                py={4}
                fontSize="lg"
                fontWeight="semibold"
                mb={isMobile ? 4 : 0}
                _hover={{
                  transform: 'translateY(-10px)',
                  shadow: 'lg',
                  textDecoration: 'none',
                }}
                as={Link}
                href="/blog"
              >
                ACESSE NOSSO CONTEÚDO
              </Button>

              {/* Dynamic Social Media Buttons */}
              <DynamicContacts location="home" />
            </HStack>
          </VStack>
        </Container>
      </Box>
    </>
  )
}
