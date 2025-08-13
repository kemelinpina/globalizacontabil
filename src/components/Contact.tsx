import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Textarea,
  useToast,
  useBreakpointValue,
} from '@chakra-ui/react'

type ContactFormData = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  _honeypot?: string
}

const initialValues: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  _honeypot: '',
}

export interface ContactProps {
  onSuccess?: () => void
  isCompact?: boolean
}

export default function Contact({ onSuccess, isCompact = false }: ContactProps) {
  const [values, setValues] = useState<ContactFormData>(initialValues)
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })

  const formatPhoneBR = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length === 0) return ''
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  const setField = (field: keyof ContactFormData, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }))
  }

  const onBlur = (field: keyof ContactFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const errors: Partial<Record<keyof ContactFormData, string>> = {}
  if (touched.name && !values.name.trim()) errors.name = 'Informe seu nome'
  if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Informe um e-mail válido'
  if (touched.message && values.message.trim().length < 10) errors.message = 'Mensagem muito curta'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setTouched({ name: true, email: true, message: true })
    if (!values.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) || values.message.trim().length < 10) {
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/pg/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data?.message || 'Erro ao enviar contato')

      toast({ title: 'Sucesso', description: data?.message || 'Mensagem enviada', status: 'success' })
      setValues(initialValues)
      setTouched({})
      if (onSuccess) onSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao enviar'
      toast({ title: 'Erro', description: message, status: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const form = (
    <Box as="form" onSubmit={handleSubmit} bg="white" p={isMobile ? 0 : 6} borderRadius="4px" boxShadow="sm" color="primary.500">
          <Flex gap={4} direction={{ base: 'column', md: 'column' }}>
            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel>Nome</FormLabel>
              <Input value={values.name} onChange={e => setField('name', e.target.value)} onBlur={() => onBlur('name')} placeholder="Seu nome" backgroundColor="#fafafa" borderColor="#fafafa!important" borderRadius="4px" />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.email} isRequired>
              <FormLabel>E-mail</FormLabel>
              <Input type="email" value={values.email} onChange={e => setField('email', e.target.value)} onBlur={() => onBlur('email')} placeholder="seu@email.com" backgroundColor="#fafafa" borderColor="#fafafa!important" borderRadius="4px" />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>
          </Flex>

          <Flex gap={4} mt={4} direction={{ base: 'column', md: 'column' }}>
            <FormControl>
              <FormLabel>Telefone</FormLabel>
              <Input
                value={values.phone}
                onChange={e => setField('phone', formatPhoneBR(e.target.value))}
                inputMode="tel"
                placeholder="(11) 99999-9999"
                maxLength={16}
                backgroundColor="#fafafa"
                borderColor="#fafafa!important"
                borderRadius="4px"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Assunto</FormLabel>
              <Input value={values.subject} onChange={e => setField('subject', e.target.value)} placeholder="Assunto" backgroundColor="#fafafa" borderColor="#fafafa!important" borderRadius="4px" />
            </FormControl>
          </Flex>

          {/* Honeypot oculto */}
          <Input type="text" name="_honeypot" value={values._honeypot} onChange={e => setField('_honeypot', e.target.value)} display="none" aria-hidden="true" tabIndex={-1} />

          <FormControl mt={4} isInvalid={!!errors.message} isRequired>
            <FormLabel>Mensagem</FormLabel>
            <Textarea value={values.message} onChange={e => setField('message', e.target.value)} onBlur={() => onBlur('message')} rows={6} placeholder="Como podemos ajudar?" backgroundColor="#fafafa" borderColor="#fafafa!important" borderRadius="4px" />
            <FormErrorMessage>{errors.message}</FormErrorMessage>
          </FormControl>

          <Button type="submit" backgroundColor='primary.500' color='white' borderRadius='4px' mt={6} isLoading={submitting} w="100%" _hover={{ backgroundColor: 'primary.600' }}>Enviar</Button>
        </Box>
  )

  if (isCompact) {
    return form
  }

  return (
    <Box bg="gray.50" py={10}>
      <Container maxW="container.md">
        <Heading size="lg" mb={6}>Fale Conosco</Heading>
        {form}
      </Container>
    </Box>
  )
}


