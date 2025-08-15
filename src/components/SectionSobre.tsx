import { useState, useEffect } from 'react'
import { Box, Button, Container, Flex, Heading, Icon, Link, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useBreakpointValue } from '@chakra-ui/react'

import { TbMailShare } from 'react-icons/tb'
import Contact from '@/components/Contact'
import { PageContent } from '@/components/ContentWithShortcodes'

interface HomeAboutData {
  id: number
  title: string
  content: string
  photo?: string
  download_button_text: string
  download_file?: string
  is_active: boolean
}

export default function SectionSobre() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [aboutData, setAboutData] = useState<HomeAboutData | null>(null)
    const [loading, setLoading] = useState(true)
    const isMobile = useBreakpointValue({ base: true, md: false })

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                const response = await fetch('/api/pg/home-about')
                const data = await response.json()
                setAboutData(data.homeAbout)
            } catch (error) {
                console.error('Erro ao buscar dados da seção sobre:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAboutData()
    }, [])

    // Se não há dados configurados, não mostra a seção
    if (loading || !aboutData || !aboutData.is_active) {
        return null
    }

    return (
        <Box mt={10} borderRadius='4px'>
            <Container minH='529px' display={isMobile ? 'block' : 'flex'} alignItems='center' maxW="container.xl" bg='transparent linear-gradient(114deg, #FFFFFF 0%, #FFFFFF 34%, #EBF6FF 56%, #FFFFFF 74%, #FFFFFF 100%) 0% 0% no-repeat padding-box;'>
                <Flex alignItems='center' p={6} gap={5} flexDirection={isMobile ? 'column-reverse' : 'row'}>
                    <Box w={isMobile ? '100%' : '50%'}>
                        <Heading as='h2' fontSize='3xl' fontWeight='bold' color='red.500' mb={2}>
                            {aboutData.title}
                        </Heading>
                        <PageContent 
                            content={aboutData.content}
                            className="about-content"
                        />
                        <Flex gap={2}>
                            <Button
                                backgroundColor='red.500'
                                color='white'
                                size='md'
                                borderRadius='4px'
                                mt={2}
                                w={isMobile ? '100%' : 'auto'}
                                rightIcon={<Icon as={TbMailShare} />}
                                onClick={onOpen}
                                _hover={{
                                    backgroundColor: 'red.600',
                                    textDecoration: 'none',
                                    transform: 'translateY(-10px)'
                                }}
                            >
                                Fale comigo por e-mail
                            </Button>
                            {aboutData.download_file && (
                                <Button
                                    as={Link}
                                    href={aboutData.download_file}
                                    target='_blank'
                                    backgroundColor='primary.500'
                                    color='white'
                                    size='md'
                                    mt={2}
                                    borderRadius='4px'
                                    _hover={{
                                        backgroundColor: 'primary.600',
                                        textDecoration: 'none',
                                        transform: 'translateY(-10px)'
                                    }}
                                >
                                    {aboutData.download_button_text}
                                </Button>
                            )}
                        </Flex>
                    </Box>
                    <Box w={isMobile ? '100%' : '50%'} position='relative'>
                        <Box w='100%' borderRadius='4px' overflow='hidden'>
                            <img 
                                src={aboutData.photo || '/andre-paravela-globaliza-contabil-colorida.png'} 
                                alt={aboutData.title}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxWidth: '600px',
                                }}
                            />
                        </Box>
                        {/* <Box display={isMobile ? 'none' : 'block'} position='absolute' top={'10%'} right={'-12%'} boxSize={40} bg='linear-gradient(114deg, #8fc2fd 0%, #235da0 34%, #0d335e 74%)' borderRadius='4px' zIndex={1}></Box> */}
                        {/* <Box display={isMobile ? 'none' : 'block'} position='absolute' bottom={'5%'} left={'-12%'} boxSize={40} bg='linear-gradient(114deg, #0d335e  56%, #235da0 74%, #8fc2fd 100%)' borderRadius='4px' zIndex={1}></Box> */}
                    </Box>
                </Flex>
            </Container>

            {/* Modal de Contato */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Fale Conosco</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Contact isCompact onSuccess={onClose} />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    )
}