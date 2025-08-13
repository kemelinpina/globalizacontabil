import React, { useState, useEffect } from 'react'
import { Box, Text, Button, VStack, HStack, Link, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useBreakpoint, useBreakpointValue } from '@chakra-ui/react'
import NextLink from 'next/link'

interface CookieConsentProps {
  onAccept?: () => void
  onDecline?: () => void
  showPolicyLink?: boolean
  policyUrl?: string
  cookieUrl?: string
}

export default function CookieConsent({ 
  onAccept, 
  onDecline, 
  showPolicyLink = true,
  policyUrl = '/politica-privacidade',
  cookieUrl = '/politica-cookies'
}: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasConsented, setHasConsented] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isMobile = useBreakpointValue({ base: true, md: false });
  

  useEffect(() => {
    // Verificar se o usuário já consentiu
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Mostrar após 1 segundo para não ser muito agressivo
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    } else {
      setHasConsented(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setHasConsented(true)
    setIsVisible(false)
    onAccept?.()
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setHasConsented(true)
    setIsVisible(false)
    onDecline?.()
  }

  const handleManagePreferences = () => {
    onOpen()
  }

  // Se já consentiu, não mostrar
  if (hasConsented) {
    return null
  }

  return (
    <>
      {/* Banner de Cookies */}
      {isVisible && (
        <Box
          position="fixed"
          bottom="20px"
          left="20px"
          maxW={isMobile ? '90%' : '400px'}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="12px"
          boxShadow="0 10px 25px rgba(0, 0, 0, 0.15)"
          p="20px"
          zIndex={9999}
          animation="slideInUp 0.3s ease-out"
          sx={{
            '@keyframes slideInUp': {
              '0%': {
                opacity: 0,
                transform: 'translateY(20px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          <VStack align="start" spacing={4}>
            {/* Ícone e Título */}
            <HStack spacing={3}>
              <Box
                w="24px"
                h="24px"
                bg="primary.500"
                borderRadius="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="14px"
                fontWeight="bold"
              >
                🍪
              </Box>
              <Text fontWeight="bold" color="gray.800" fontSize="16px">
                Cookies e Privacidade
              </Text>
            </HStack>

            {/* Descrição */}
            <Text fontSize="14px" color="gray.600" lineHeight="1.5">
              Utilizamos cookies para melhorar sua experiência, analisar o tráfego do site e personalizar conteúdo. 
              Ao continuar navegando, você concorda com nossa{' '}
              <Link as={NextLink} href={policyUrl} color="primary.500" textDecoration="underline" _hover={{ textDecoration: 'none' }}>
                Política de Privacidade
              </Link>
              {' '}e{' '}
              <Link as={NextLink} href={cookieUrl} color="primary.500" textDecoration="underline" _hover={{ textDecoration: 'none' }}>
                Política de Cookies
              </Link>.
            </Text>

            {/* Botões */}
            <HStack spacing={3} w="100%">
              <Button
                size="sm"
                colorScheme="primary"
                onClick={handleAccept}
                flex={1}
                borderRadius="8px"
                fontSize="14px"
                fontWeight="500"
              >
                Aceitar Todos
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleManagePreferences}
                flex={1}
                borderRadius="8px"
                fontSize="14px"
                fontWeight="500"
                borderColor="gray.300"
                color="gray.700"
                _hover={{ bg: 'gray.50' }}
              >
                Personalizar
              </Button>
            </HStack>

            {/* Botão Rejeitar */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDecline}
              w="100%"
              fontSize="13px"
              color="gray.500"
              _hover={{ bg: 'gray.100' }}
            >
              Rejeitar Todos
            </Button>

            {/* Link para Políticas */}
            {showPolicyLink && (
              <HStack spacing={4} fontSize="12px" color="gray.500">
                <Link as={NextLink} href={policyUrl} _hover={{ color: 'primary.500' }}>
                  Política de Privacidade
                </Link>
                <Link as={NextLink} href={cookieUrl} _hover={{ color: 'primary.500' }}>
                  Política de Cookies
                </Link>
              </HStack>
            )}
          </VStack>

          {/* Botão Fechar */}
          <Button
            position="absolute"
            top="10px"
            right="10px"
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
            color="gray.400"
            _hover={{ bg: 'gray.100' }}
            borderRadius="50%"
            w="24px"
            h="24px"
            minW="24px"
            p={0}
          >
            ×
          </Button>
        </Box>
      )}

      {/* Modal de Preferências */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="12px">
          <ModalHeader color="primary.500">
            <HStack spacing={3}>
              <Box
                w="32px"
                h="32px"
                bg="primary.500"
                borderRadius="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="18px"
                fontWeight="bold"
              >
                ⚙️
              </Box>
              <Text>Preferências de Cookies</Text>
            </HStack>
          </ModalHeader>
          
          <ModalBody>
            <VStack align="start" spacing={6}>
              {/* Cookies Essenciais */}
              <Box w="100%">
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="bold" color="gray.800">
                    Cookies Essenciais
                  </Text>
                  <Box
                    w="20px"
                    h="20px"
                    bg="green.500"
                    borderRadius="50%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="12px"
                    fontWeight="bold"
                  >
                    ✓
                  </Box>
                </HStack>
                <Text fontSize="14px" color="gray.600" lineHeight="1.5">
                  Necessários para o funcionamento básico do site. Não podem ser desativados.
                </Text>
              </Box>

              {/* Cookies de Analytics */}
              <Box w="100%">
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="bold" color="gray.800">
                    Cookies de Analytics
                  </Text>
                  <Box
                    w="20px"
                    h="20px"
                    bg="blue.500"
                    borderRadius="50%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="12px"
                    fontWeight="bold"
                  >
                    ?
                  </Box>
                </HStack>
                <Text fontSize="14px" color="gray.600" lineHeight="1.5">
                  Nos ajudam a entender como os visitantes interagem com o site, coletando e relatando informações anonimamente.
                </Text>
              </Box>

              {/* Cookies de Marketing */}
              <Box w="100%">
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="bold" color="gray.800">
                    Cookies de Marketing
                  </Text>
                  <Box
                    w="20px"
                    h="20px"
                    bg="orange.500"
                    borderRadius="50%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="12px"
                    fontWeight="bold"
                  >
                    ?
                  </Box>
                </HStack>
                <Text fontSize="14px" color="gray.600" lineHeight="1.5">
                  Usados para rastrear visitantes em sites. A intenção é exibir anúncios relevantes e envolventes.
                </Text>
              </Box>

              {/* Informações Adicionais */}
              <Box 
                bg="blue.50" 
                p={4} 
                borderRadius="8px" 
                border="1px solid" 
                borderColor="blue.200"
                w="100%"
              >
                <Text fontSize="13px" color="blue.800" lineHeight="1.5">
                  <strong>Nota:</strong> Você pode alterar suas preferências a qualquer momento acessando nossa Política de Cookies. 
                  Alguns cookies podem ser necessários para o funcionamento do site.
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="primary"
                onClick={() => {
                  handleAccept()
                  onClose()
                }}
              >
                Aceitar Selecionados
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

// Hook para gerenciar consentimento de cookies
export function useCookieConsent() {
  const [consent, setConsent] = useState<string | null>(null)
  const [consentDate, setConsentDate] = useState<string | null>(null)

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookie-consent')
    const storedDate = localStorage.getItem('cookie-consent-date')
    
    setConsent(storedConsent)
    setConsentDate(storedDate)
  }, [])

  const updateConsent = (newConsent: string) => {
    localStorage.setItem('cookie-consent', newConsent)
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setConsent(newConsent)
    setConsentDate(new Date().toISOString())
  }

  const clearConsent = () => {
    localStorage.removeItem('cookie-consent')
    localStorage.removeItem('cookie-consent-date')
    setConsent(null)
    setConsentDate(null)
  }

  const hasConsented = consent === 'accepted'
  const hasDeclined = consent === 'declined'
  const needsConsent = consent === null

  return {
    consent,
    consentDate,
    hasConsented,
    hasDeclined,
    needsConsent,
    updateConsent,
    clearConsent
  }
}
