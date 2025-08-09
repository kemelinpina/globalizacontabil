import { 
  FaInstagram, 
  FaLinkedinIn, 
  FaWhatsapp, 
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaTiktok,
  FaEnvelope,
  FaPhone,
  FaGlobe
} from 'react-icons/fa'

export interface ContactType {
  icon: React.ComponentType
  defaultColor: string
  label: string
  urlPrefix?: string
  placeholder?: string
  validation?: (value: string) => boolean
}

export const contactTypes: Record<string, ContactType> = {
  telefone: {
    icon: FaPhone,
    defaultColor: '#66CC33',
    label: 'Telefone',
    urlPrefix: 'tel:',
    placeholder: '(11) 9999-9999',
    validation: (value: string) => /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)
  },
  whatsapp: {
    icon: FaWhatsapp,
    defaultColor: '#66CC33',
    label: 'WhatsApp',
    urlPrefix: 'https://wa.me/',
    placeholder: '5511999999999',
    validation: (value: string) => /^\d{13}$/.test(value)
  },
  instagram: {
    icon: FaInstagram,
    defaultColor: '#E82FA4',
    label: 'Instagram',
    urlPrefix: 'https://www.instagram.com/',
    placeholder: 'usuario_instagram',
    validation: (value: string) => /^[a-zA-Z0-9._]+$/.test(value)
  },
  linkedin: {
    icon: FaLinkedinIn,
    defaultColor: '#0077B5',
    label: 'LinkedIn',
    urlPrefix: 'https://www.linkedin.com/in/',
    placeholder: 'nome-usuario',
    validation: (value: string) => /^[a-zA-Z0-9-]+$/.test(value)
  },
  facebook: {
    icon: FaFacebook,
    defaultColor: '#1877F2',
    label: 'Facebook',
    urlPrefix: 'https://www.facebook.com/',
    placeholder: 'pagina.facebook',
    validation: (value: string) => /^[a-zA-Z0-9.]+$/.test(value)
  },
  twitter: {
    icon: FaTwitter,
    defaultColor: '#1DA1F2',
    label: 'Twitter/X',
    urlPrefix: 'https://twitter.com/',
    placeholder: 'usuario_twitter',
    validation: (value: string) => /^[a-zA-Z0-9_]+$/.test(value)
  },
  youtube: {
    icon: FaYoutube,
    defaultColor: '#FF0000',
    label: 'YouTube',
    urlPrefix: 'https://www.youtube.com/',
    placeholder: 'c/NomeCanal',
    validation: (value: string) => value.length > 0
  },
  tiktok: {
    icon: FaTiktok,
    defaultColor: '#000000',
    label: 'TikTok',
    urlPrefix: 'https://www.tiktok.com/@',
    placeholder: 'usuario_tiktok',
    validation: (value: string) => /^[a-zA-Z0-9._]+$/.test(value)
  },
  email: {
    icon: FaEnvelope,
    defaultColor: '#EA4335',
    label: 'E-mail',
    urlPrefix: 'mailto:',
    placeholder: 'contato@exemplo.com',
    validation: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },
  website: {
    icon: FaGlobe,
    defaultColor: '#666666',
    label: 'Website',
    placeholder: 'https://exemplo.com',
    validation: (value: string) => /^https?:\/\/.+\..+$/.test(value)
  }
}

export const getContactTypeOptions = () => {
  return Object.entries(contactTypes).map(([key, config]) => ({
    value: key,
    label: config.label
  }))
}

export const formatContactLink = (type: string, value: string): string => {
  const config = contactTypes[type]
  if (!config) return value

  // Se já tem protocolo, retorna como está
  if (value.startsWith('http') || value.startsWith('tel:') || value.startsWith('mailto:')) {
    return value
  }

  // Aplicar prefix se configurado
  if (config.urlPrefix) {
    return config.urlPrefix + value
  }

  return value
}

export const validateContactValue = (type: string, value: string): boolean => {
  const config = contactTypes[type]
  if (!config || !config.validation) return true
  
  return config.validation(value)
}

export const getContactIcon = (type: string) => {
  return contactTypes[type]?.icon || FaGlobe
}

export const getContactColor = (type: string, customColor?: string): string => {
  if (customColor) return customColor
  return contactTypes[type]?.defaultColor || '#666666'
}

