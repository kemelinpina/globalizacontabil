import { Box, Button, Container, Flex, Heading, Icon, Link, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from '@chakra-ui/react'
import Image from 'next/image'
import { TbMailShare } from 'react-icons/tb'
import Contact from '@/components/Contact'

export default function SectionSobre() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (
        <Box mt={10} borderRadius='4px'>
            <Container minH='529px' display='flex' alignItems='center' maxW="container.xl" bg='transparent linear-gradient(114deg, #FFFFFF 0%, #FFFFFF 34%, #EBF6FF 56%, #FFFFFF 74%, #FFFFFF 100%) 0% 0% no-repeat padding-box;'>
                <Flex alignItems='center' p={6} gap={5}>
                    <Box w='50%'>
                        <Heading as='h2' fontSize='3xl' fontWeight='bold' color='red.500' mb={2}>Sobre Andre Paravela</Heading>
                        <Text color='primary.500' mb={3}>
                            Formado em Ciências contábeis e em direito pela <Link href="https://www.puc.br/campinas" target="_blank" color='red.500' _hover={{ textDecoration: 'none' }} fontWeight='bold'>PUC</Link> de Campinas, com pós graduação em Finanças pela <Link href="https://www.usp.br/esalq" target="_blank" color='red.500' _hover={{ textDecoration: 'none' }} fontWeight='bold'>USP Esalq</Link>, executivo de Finanças Global com mais de 20 anos de experiência em corporações multinacionais e firmas do Big Four. Duplamente qualificado como contador e advogado registrado no Brasil, com certificação adicional pela <Link href="https://www.accaglobal.com/br/pt/home.html" target="_blank" color='red.500' _hover={{ textDecoration: 'none' }} fontWeight='bold'>ACCA</Link> e atualmente em processo de obtenção da certificação <Link href="https://www.aicpa.org/content/dam/aicpa/membership/cpa/cpa-certification/pdf/aicpa-cpa-certification-handbook.pdf" target="_blank" color='red.500' _hover={{ textDecoration: 'none' }} fontWeight='bold'>AICPA</Link>.
                        </Text>
                        <Text color='primary.500'>
                            Atua como consultor de Finanças Global na <Link href="https://www.globaliza.com.br/" target="_blank" color='red.500' _hover={{ textDecoration: 'none' }} fontWeight='bold'>Globaliza</Link>, empresa de consultoria em Finanças Global com mais de 20 anos de experiência em corporações multinacionais e firmas do Big Four.
                        </Text>
                        <Flex gap={2}>
                            <Button
                                backgroundColor='red.500'
                                color='white'
                                size='md'
                                borderRadius='4px'
                                mt={2}
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
                            <Button
                                as={Link}
                                href='https://www.linkedin.com/in/andre-paravela/'
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
                                Baixe o novo material
                            </Button>
                        </Flex>
                    </Box>
                    <Box w='50%' position='relative'>
                        <Box w='100%' borderRadius='4px' overflow='hidden'>
                            <Image src='/andre-paravela-globaliza-contabil-colorida.png' alt='Andre Paravela' width={600} height={600} />
                        </Box>
                        <Box position='absolute' top={'10%'} right={'-12%'} boxSize={40} bg='linear-gradient(114deg, #8fc2fd 0%, #235da0 34%, #0d335e 74%)' borderRadius='4px' zIndex={1}></Box>
                        <Box position='absolute' bottom={'5%'} left={'-12%'} boxSize={40} bg='linear-gradient(114deg, #0d335e  56%, #235da0 74%, #8fc2fd 100%)' borderRadius='4px' zIndex={1}></Box>
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