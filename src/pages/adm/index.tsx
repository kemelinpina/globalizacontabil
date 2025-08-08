import {
  Box,
  Container,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Card,
  CardBody,
  Text,
  Link,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import Head from 'next/head'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()
  const { login } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const success = await login(email, password)

      if (success) {
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Bem-vindo de volta!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        router.push('/adm/home')
      } else {
        toast({
          title: 'Erro no login',
          description: 'Email ou senha incorretos',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Erro no login:', error)
      toast({
        title: 'Erro no login',
        description: error instanceof Error ? error.message : 'Email ou senha incorretos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast({
        title: 'Email obrigatório',
        description: 'Por favor, informe seu email',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setForgotLoading(true)

    try {
      const response = await fetch('/api/pg/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Email enviado!',
          description: 'Caso o e-mail esteja cadastrado no sistema, logo você receberá um email para cadastrar o novo acesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        onClose()
        setForgotEmail('')
      } else {
        toast({
          title: 'Email enviado!',
          description: 'Caso o e-mail esteja cadastrado no sistema, logo você receberá um email para cadastrar o novo acesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        onClose()
        setForgotEmail('')
      }
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error)
      toast({
        title: 'Email enviado!',
        description: 'Caso o e-mail esteja cadastrado no sistema, logo você receberá um email para cadastrar o novo acesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      onClose()
      setForgotEmail('')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login - Globaliza Contabil</title>
      </Head>

      <Box
        as="main"
        minH="100vh"
        display="flex"
        alignItems="center"
        background="transparent linear-gradient(110deg, #FAFAFA 0%, #FAFAFA 47%, #EBF6FF 75%, #EBF6FF 82%, #FAFAFA 96%, #FAFAFA 100%) 0% 0% no-repeat padding-box"
      >
        <Container maxW="md">
          <Card
            shadow="xl"
            borderRadius="lg"
            bg="white"
          >
            <CardBody>
              <VStack spacing={6}>
                <Box textAlign="center">
                  <Box mb={4}>
                    <Image
                      src="/logo-globaliza.svg"
                      alt="Globaliza Contabil"
                      width={200}
                      height={50}
                      style={{
                        objectFit: 'contain',
                        margin: '0 auto'
                      }}
                    />
                  </Box>
                </Box>

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel color="gray.700" fontWeight="medium">
                        Email
                      </FormLabel>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        size="lg"
                        borderRadius="md"
                        borderColor="gray.300"
                        _focus={{
                          borderColor: 'primary.500',
                          boxShadow: '0 0 0 1px var(--color-primary)',
                        }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.700" fontWeight="medium">
                        Senha
                      </FormLabel>
                      <Input
                        type="password"
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        size="lg"
                        borderRadius="md"
                        borderColor="gray.300"
                        _focus={{
                          borderColor: 'primary.500',
                          boxShadow: '0 0 0 1px var(--color-primary)',
                        }}
                      />
                    </FormControl>

                    <Flex w='100%' gap={4}>
                      <Button
                        type="button"
                        colorScheme="primary"
                        variant='ghost'
                        size="lg"
                        width="full"
                        onClick={onOpen}
                        fontSize="md"
                        fontWeight='normal'
                        px={0}
                      >
                        Esqueci a senha
                      </Button>
                      <Button
                        type="submit"
                        colorScheme="primary"
                        size="lg"
                        width="full"
                        isLoading={loading}
                        bg="primary.500"
                        _hover={{
                          bg: 'primary.600',
                        }}
                        _active={{
                          bg: 'primary.700',
                        }}
                        fontWeight="semibold"
                        fontSize="md"
                      >
                        Entrar
                      </Button>
                    </Flex>
                  </VStack>
                </form>
              </VStack>
            </CardBody>
          </Card>
          <Text mt={4} textAlign='center'>Desenvolvido por <Link href='https://3hub.co' target='_blank' color={'accent.600'} fontWeight='bold' _hover={{ color: 'accent.800', textDecoration: 'none' }}>3Hub</Link></Text>
        </Container>
      </Box>

      {/* Modal de Recuperação de Senha */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Recuperar Senha</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>
                Digite seu email para receber um link de recuperação de senha.
              </Text>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  size="lg"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="primary"
              onClick={handleForgotPassword}
              isLoading={forgotLoading}
            >
              Enviar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
} 