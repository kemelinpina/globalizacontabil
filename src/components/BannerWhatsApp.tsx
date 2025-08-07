import { Button, Flex, Heading } from '@chakra-ui/react'
import { FaWhatsapp } from 'react-icons/fa'
import Link from 'next/link'

export default function BannerWhatsApp() {
    return (
        <Flex w='100%' bg='primary.500' minH='276px' p={8} borderRadius='4px' gap={4} alignItems='center' flexDirection='column' justifyContent='center'>
            <Heading as='h3' fontSize='3xl' fontWeight='bold' color='white'>Acesse nosso grupo de WhatsApp</Heading>
            <Button
                as={Link}
                href='https://wa.me/5511999999999'
                target='_blank'
                aria-label='WhatsApp'
                colorScheme='whatsapp'
                rightIcon={<FaWhatsapp />}
                size='lg'
                borderRadius='4px'
                fontWeight='bold'
            >
                Entrar para o grupo
            </Button>
        </Flex>
    )
}   