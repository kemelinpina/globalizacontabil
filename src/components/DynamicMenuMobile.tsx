// src/components/DynamicMenuMobile.tsx
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Skeleton, VStack, Box } from '@chakra-ui/react'

interface MenuItem {
  id: number
  title: string
  url?: string
  target: string
  order: number
  is_active: boolean
  children?: MenuItem[]
}

interface Menu {
  id: number
  name: string
  location: string
  is_active: boolean
  menu_items: MenuItem[]
}

interface DynamicMenuMobileProps {
  location: string
  className?: string
}

export default function DynamicMenuMobile({ location, className = '' }: DynamicMenuMobileProps) {
  const [menu, setMenu] = useState<Menu | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchMenu()
  }, [location])

  const fetchMenu = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/pg/menus?location=${location}&include_items=true`)
      
      if (response.ok) {
        const data = await response.json()
        const activeMenu = data.menus.find((m: Menu) => m.is_active)
        setMenu(activeMenu || null)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar menu:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderMenuItem = (item: MenuItem) => {
    const isActive = router.pathname === item.url || 
                    (item.url && router.pathname.startsWith(item.url))

    const linkProps = {
      href: item.url || '#',
      target: item.target,
      className: `menu-item ${isActive ? 'active' : ''}`,
      onClick: (e: React.MouseEvent) => {
        if (!item.url || item.url === '#') {
          e.preventDefault()
        }
      }
    }

    return (
      <li key={item.id} className="menu-item-wrapper">
        <Link {...linkProps}>
          {item.title}
        </Link>
        {item.children && item.children.length > 0 && (
          <ul className="submenu">
            {item.children.map(renderMenuItem)}
          </ul>
        )}
      </li>
    )
  }

  if (loading) {
    return (
      <nav className={`dynamic-menu-mobile ${className}`}>
        <VStack spacing={3} align="stretch" w="full">
          {/* Skeleton para 4 itens de menu */}
          {[1, 2, 3, 4].map((item) => (
            <Box key={item}>
              <Skeleton height="20px" width="100%" />
            </Box>
          ))}
        </VStack>
      </nav>
    )
  }

  if (!menu || !menu.menu_items || menu.menu_items.length === 0) {
    return null
  }

  return (
    <nav className={`dynamic-menu-mobile ${className}`}>
      <ul className="menu-list">
        {menu.menu_items.map(renderMenuItem)}
      </ul>
    </nav>
  )
}
