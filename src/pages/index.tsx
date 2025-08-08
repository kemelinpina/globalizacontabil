import React from 'react'
import { Box, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from '@chakra-ui/react'
import Head from 'next/head'
import HeroSection from '@/components/HeroSection'
import Contact from '@/components/Contact'
import PostDestaque from '../components/PostDestaque'
import PostsCarousel from '../components/PostsCarousel'
import BannerWhatsApp from '../components/BannerWhatsApp'
import Footer from '../components/Footer'
import Header from '../components/Header'
import SectionSobre from '@/components/SectionSobre'

export default function Home() {
  const { isOpen, onClose } = useDisclosure()

  return (
    <>
      <Head>
        <title>Globaliza Contabil - Blog</title>
        <meta name="description" content="Se torne um contador global com a Globaliza Contabil" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </Head>

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Posts Carousel */}
      <PostsCarousel 
        title="A jornada para uma certificação internacional parece um labirinto?"
        subtitle="Conteúdo exclusivo para sua carreira contábil internacional"
      />

      {/* Post Destaque */}
      <PostDestaque />

      {/* Section Sobre */}
      <SectionSobre />

      {/* WhatsApp Banner */}
      <Box py={8}>
        <BannerWhatsApp />
      </Box>

      {/* Footer */}
      <Footer />

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
    </>
  )
} 