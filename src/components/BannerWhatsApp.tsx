import { useState, useEffect } from 'react'
import { Box, Button, Container, Flex, Heading, Text, useBreakpointValue } from '@chakra-ui/react'
import { FaWhatsapp } from 'react-icons/fa'
import Link from 'next/link'

interface BannerWhatsAppData {
  id: number
  title: string
  description?: string
  button_text: string
  whatsapp_link: string
  background_image?: string
  background_color: string
  is_active: boolean
}

export default function BannerWhatsApp() {
    const [bannerData, setBannerData] = useState<BannerWhatsAppData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const isMobile = useBreakpointValue({ base: true, md: false })

    useEffect(() => {
        const fetchBannerData = async () => {
            try {
                setError(null)
                const response = await fetch('/api/pg/banner-whatsapp')
                
                if (!response.ok) {
                    throw new Error(`Erro ${response.status}: ${response.statusText}`)
                }
                
                const data = await response.json()
                setBannerData(data.bannerWhatsApp)
            } catch (error) {
                console.error('Erro ao buscar dados do banner WhatsApp:', error)
                setError(error instanceof Error ? error.message : 'Erro desconhecido')
            } finally {
                setLoading(false)
            }
        }

        fetchBannerData()
    }, [])

    // Se está carregando, mostra loading
    if (loading) {
        return null // Ou um skeleton/loading se preferir
    }

    // Se há erro, não mostra o banner
    if (error) {
        console.error('Erro no banner WhatsApp:', error)
        return null
    }

    // Se não há dados configurados ou está inativo, não mostra o banner
    if (!bannerData || !bannerData.is_active) {
        return null
    }

    return (
        <>
            <Box p={0}>
                <Container maxW="container.xl" p={0}>
                    <Flex 
                        w='100%' 
                        bg={bannerData.background_color || 'primary.500'}
                        backgroundImage={bannerData.background_image ? `url(${bannerData.background_image})` : 'none'}
                        backgroundSize='cover'
                        backgroundPosition='center'
                        backgroundBlendMode={bannerData.background_image ? 'overlay' : 'normal'}
                        minH='276px' 
                        p={8} 
                        borderRadius='4px' 
                        gap={4} 
                        alignItems='center' 
                        flexDirection='column' 
                        justifyContent='center'
                    >
                        <Heading as='h3' fontSize={isMobile ? '2xl' : '3xl'} fontWeight='bold' color='white' textAlign='center'>
                            {bannerData.title}
                        </Heading>
                        
                        {bannerData.description && (
                            <Text fontSize='lg' color='white' textAlign='center' maxW='2xl'>
                                {bannerData.description}
                            </Text>
                        )}
                        
                        <Button
                            as={Link}
                            href={bannerData.whatsapp_link}
                            target='_blank'
                            aria-label='WhatsApp'
                            colorScheme='whatsapp'
                            rightIcon={<FaWhatsapp fontSize='23px' fontWeight='900' />}
                            size='lg'
                            borderRadius='4px'
                            fontWeight='bold'
                            w={isMobile ? '100%' : 'auto'}
                            _hover={{
                                backgroundColor: 'whatsapp.600',
                                textDecoration: 'none',
                                transform: 'translateY(-10px)'
                            }}
                        >
                            {bannerData.button_text}
                        </Button>
                    </Flex>
                </Container>
            </Box>
        </>
    )
}   