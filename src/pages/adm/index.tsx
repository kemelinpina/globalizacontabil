import { useState } from 'react'
import { 
  Box, 
  Button, 
  Container, 
  FormControl, 
  FormLabel, 
  Input, 
  VStack, 
  Heading, 
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/pg/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro no login')
      }

      // Login bem-sucedido
      toast({
        title: 'Login realizado com sucesso!',
        description: `Bem-vindo, ${data.user.name}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Redirecionar para o dashboard
      router.push('/adm/home')

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

  return (
    <>
      <Head>
        <title>Login - Globaliza Contabil</title>
      </Head>
      
      <Box 
        minH="100vh" 
        bg="gray.50" 
        display="flex" 
        alignItems="center"
      >
        <Container maxW="md">
          <Box 
            bg="white" 
            p={8} 
            borderRadius="lg" 
            boxShadow="lg"
          >
            <VStack gap={6}>
              <Heading size="lg" color="blue.600">
                Globaliza Contabil
              </Heading>
              
              <Text color="gray.600" textAlign="center">
                Painel Administrativo
              </Text>

              <Box as="form" w="full" onSubmit={handleSubmit}>
                <VStack gap={4}>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Senha</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Sua senha"
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                          onClick={() => setShowPassword(!showPassword)}
                          variant="ghost"
                          size="sm"
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    w="full"
                    isLoading={loading}
                    loadingText="Entrando..."
                  >
                    Entrar
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </Box>
        </Container>
      </Box>
    </>
  )
} 