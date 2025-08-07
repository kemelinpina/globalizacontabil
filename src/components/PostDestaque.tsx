import { Box, Heading, Text, Link, Container, Flex, Badge, Icon } from '@chakra-ui/react'
import Image from 'next/image'
import { FiCalendar } from 'react-icons/fi'

export default function PostDestaque() {
    return (
        <>
            <Box bg="#fafafa" mt={'60px'}>
                <Container maxW="container.xl" display="flex" borderRadius='4px' bg='white' p={4}>
                    <Box w='25%' h='100%' boxSize={'25%'} minH={'357px'} bgImage={'/default.png'} bgSize='cover' bgPosition='center' bgRepeat='no-repeat'>
                    </Box>
                    <Box w='75%' h='100%' p={4}>
                        <Heading as='h3' fontSize='2xl' fontWeight='600' textAlign='left' color='red.500' mb={2}>
                            Título do Post
                        </Heading>
                        <Text fontSize='14px' fontWeight='400' textAlign='left' color='primary.500' mb={2}>
                            Inseguro sobre como validar seu diploma brasileiro no exterior?
                        </Text>
                        <Flex gap={3} mt={2} mb={4}>
                            <Badge
                                borderRadius='4px'
                                backgroundColor={'#FEDDDD'}
                                color='red.500'
                                fontWeight='600'
                                fontStyle='italic'
                            >Certificações</Badge>
                            <Badge
                                borderRadius='4px'
                                backgroundColor={'#FEDDDD'}
                                color='red.500'
                                fontWeight='600'
                                fontStyle='italic'
                            ><Icon as={FiCalendar} mr={1} />Teste</Badge>
                        </Flex>
                        <Link href='/post/1' color='red.500' fontWeight='bold' fontSize='12px' mt={4} _hover={{ textDecoration: 'none' }}>
                            Continue lendo
                        </Link>
                    </Box>
                </Container>
            </Box>
        </>
    )
}