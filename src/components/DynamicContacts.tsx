import { useState, useEffect } from 'react'
import { Flex, IconButton, Link } from '@chakra-ui/react'
import { getContactIcon, getContactColor } from '../utils/contactTypes'

interface Contact {
  id: number
  location: string
  type: string
  title?: string
  link: string
  order: number
  custom_color?: string
  is_active: boolean
}

interface DynamicContactsProps {
  location: 'header' | 'footer' | 'home'
}

export default function DynamicContacts({ location }: DynamicContactsProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`/api/pg/contacts?location=${location}&active=true`)
        const data = await response.json()
        setContacts(data.contacts || [])
      } catch (error) {
        console.error('Erro ao buscar contatos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [location])

  if (loading || contacts.length === 0) {
    return null
  }

  return (
    <Flex gap={4} justifyContent={location === 'header' ? 'flex-end' : location === 'home' ? 'center' : 'flex-start'} alignItems='center'>
      {contacts.map((contact) => {
        const IconComponent = getContactIcon(contact.type)
        const color = getContactColor(contact.type, contact.custom_color)
        
        return (
          <IconButton
            key={contact.id}
            as={Link}
            href={contact.link}
            target="_blank"
            aria-label={contact.title || contact.type}
            icon={<IconComponent />}
            color={color}
            fontSize="23px"
            size="md"
            variant="ghost"
            bg="white"
            _hover={{
              bg: 'white',
              transform: 'translateY(-10px)',
            }}
          />
        )
      })}
    </Flex>
  )
}
