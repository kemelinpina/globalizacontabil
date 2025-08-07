// Cores globais do projeto Globaliza Contabil
export const colors = {
  // Cores principais
  primary: '#013F71',      // Cor principal - azul escuro
  accent: '#FA0A0A',       // Cor destaque e links - vermelho
  success: '#66CC33',      // Verde para sucessos
  info: '#0876D0',         // Azul para informações
  
  // Variações das cores principais
  primaryLight: '#1a5a8a',
  primaryDark: '#012a4a',
  accentLight: '#ff3333',
  accentDark: '#cc0000',
  
  // Cores neutras
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Estados
  error: '#FA0A0A',        // Usar accent para erros
  warning: '#f59e0b'
}

// Configuração para Chakra UI
export const chakraTheme = {
  colors: {
    primary: {
      50: '#e6f0f7',
      100: '#b3d1e8',
      200: '#80b2d9',
      300: '#4d93ca',
      400: '#1a74bb',
      500: '#013F71',      // Cor principal
      600: '#013a66',
      700: '#01355b',
      800: '#013050',
      900: '#012b45',
    },
    accent: {
      50: '#ffe6e6',
      100: '#ffb3b3',
      200: '#ff8080',
      300: '#ff4d4d',
      400: '#ff1a1a',
      500: '#FA0A0A',      // Cor destaque
      600: '#e60000',
      700: '#cc0000',
      800: '#b30000',
      900: '#990000',
    },
    success: {
      500: '#66CC33',
    },
    info: {
      500: '#0876D0',
    },
  },
}

// Configuração para Ant Design
export const antdTheme = {
  token: {
    colorPrimary: '#013F71',
    colorSuccess: '#66CC33',
    colorWarning: '#f59e0b',
    colorError: '#FA0A0A',
    colorInfo: '#0876D0',
    colorLink: '#FA0A0A',
    colorLinkHover: '#cc0000',
  },
}

// CSS Variables para uso global
export const cssVariables = `
  :root {
    --color-primary: #013F71;
    --color-accent: #FA0A0A;
    --color-success: #66CC33;
    --color-info: #0876D0;
    --color-error: #FA0A0A;
    --color-warning: #f59e0b;
    
    --color-primary-light: #1a5a8a;
    --color-primary-dark: #012a4a;
    --color-accent-light: #ff3333;
    --color-accent-dark: #cc0000;
  }
` 