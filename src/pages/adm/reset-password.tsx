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
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState('')
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    const { token: urlToken } = router.query
    if (urlToken && typeof urlToken === 'string') {
      setToken(urlToken)
    }
  }, [router.query])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast({
        title: 'Token inválido',
        description: 'Link de redefinição inválido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'As senhas digitadas não são iguais',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/pg/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Senha alterada com sucesso!',
          description: 'Você pode fazer login com sua nova senha',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        router.push('/adm')
      } else {
        toast({
          title: 'Erro ao redefinir senha',
          description: data.message || 'Token inválido ou expirado',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      toast({
        title: 'Erro ao redefinir senha',
        description: 'Ocorreu um erro inesperado',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <Box
        as="main"
        minH="100vh"
        display="flex"
        alignItems="center"
        background="transparent linear-gradient(110deg, #FAFAFA 0%, #FAFAFA 47%, #EBF6FF 75%, #EBF6FF 82%, #FAFAFA 96%, #FAFAFA 100%) 0% 0% no-repeat padding-box"
      >
        <Container maxW="md">
          <Card shadow="xl" borderRadius="lg" bg="white">
            <CardBody>
              <VStack spacing={6}>
                <Text textAlign="center" fontSize="lg">
                  Link de redefinição inválido ou expirado.
                </Text>
                <Button
                  colorScheme="primary"
                  onClick={() => router.push('/adm')}
                >
                  Voltar ao Login
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    )
  }

  return (
    <>
      <Head>
        <title>Redefinir Senha - Globaliza Contabil</title>
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
                  <Text fontSize="xl" fontWeight="bold" mb={2}>
                    Redefinir Senha
                  </Text>
                  <Text color="gray.600">
                    Digite sua nova senha
                  </Text>
                </Box>

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel color="gray.700" fontWeight="medium">
                        Nova Senha
                      </FormLabel>
                      <Input
                        type="password"
                        placeholder="Digite sua nova senha"
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

                    <FormControl isRequired>
                      <FormLabel color="gray.700" fontWeight="medium">
                        Confirmar Nova Senha
                      </FormLabel>
                      <Input
                        type="password"
                        placeholder="Confirme sua nova senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        size="lg"
                        borderRadius="md"
                        borderColor="gray.300"
                        _focus={{
                          borderColor: 'primary.500',
                          boxShadow: '0 0 0 1px var(--color-primary)',
                        }}
                      />
                    </FormControl>

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
                      Redefinir Senha
                    </Button>
                  </VStack>
                </form>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    </>
  )
}
