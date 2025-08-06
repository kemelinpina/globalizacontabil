# Documentação de Implementação - Projeto Similar ao Contemp

## 📋 Visão Geral

Este documento fornece um guia completo para implementar um projeto web com painel administrativo, baseado na arquitetura do projeto Contemp. O projeto inclui frontend, backend, banco de dados e funcionalidades administrativas.

## 🏗️ Arquitetura do Sistema

### Stack Tecnológica Principal
- **Frontend**: Next.js 12.3.1 + React 18.2.0 + TypeScript
- **UI Framework**: Chakra UI 2.8.2 + Ant Design 5.6.0
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: Cookies + bcryptjs
- **Upload de Arquivos**: Multer + next-connect
- **Email**: SendinBlue API
- **Deploy**: Vercel/Produção

### Estrutura de Diretórios
```
projeto/
├── src/
│   ├── pages/
│   │   ├── _app.tsx
│   │   ├── adm/           # Painel administrativo
│   │   └── api/pg/        # APIs do backend
│   ├── components/         # Componentes React
│   ├── lib/               # Configurações (Prisma, Axios)
│   ├── contextAuth/       # Context de autenticação
│   ├── utils/             # Utilitários
│   └── styles/            # Estilos CSS
├── prisma/
│   └── schema.prisma      # Schema do banco
├── public/                # Arquivos estáticos
└── package.json
```

## 🗄️ Banco de Dados (Prisma Schema)

### Principais Tabelas

#### 1. Users (Usuários)
```prisma
model Users {
  id            Int            @id @default(autoincrement())
  name          String
  email         String
  password      String
  super_adm     Boolean        @default(true)
  picture       String?
  is_active     Boolean        @default(true)
  created_at    DateTime       @default(now())
  updated_at    DateTime?      @default(now())
  profile_id    Int?
}
```

#### 2. Categories (Categorias)
```prisma
model Categories {
  id                 Int        @id @default(autoincrement())
  description        String
  description_seo    String
  favorite           Boolean    @default(false)
  is_active          Boolean    @default(true)
  is_main            Boolean    @default(false)
  key_word_seo       String?
  name               String
  order              Int        @unique
  url                String?
  link_personalite   String?
  created_at         DateTime?  @default(now())
  updated_at         DateTime?  @default(now())
  Products           Products[]
}
```

#### 3. Products (Produtos)
```prisma
model Products {
  id               Int                   @id @default(autoincrement())
  description      String
  description_seo  String
  destaque         Boolean               @default(false)
  hasVariation     Boolean               @default(false)
  isActive         Boolean               @default(true)
  key_word_seo     String
  name             String
  listVariation    Json?
  tab              Json?
  urls             Json?
  category_id      Int
  call_product     String
  order            Int?                  @unique
  layout           Int?
  thumbnail        String?
  link_personalite String?
  name_style       String?
  created_at       DateTime?             @default(now())
  updated_at       DateTime?             @default(now())
  category         Categories            @relation(fields: [category_id], references: [id])
}
```

#### 4. Banners (Banners)
```prisma
model Banners {
  id          Int       @id @default(autoincrement())
  url         String
  type        String?
  order       Int       @unique
  title       String?
  subtitle    String?
  description String?
  redirect    String?
  status      Boolean?  @default(true)
  created_at  DateTime  @default(now())
  updated_at  DateTime? @default(now())
  end_date    DateTime?
  start_date  DateTime?
}
```

#### 5. Logs (Logs de Atividade)
```prisma
model Logs {
  id          Int      @id @default(autoincrement())
  user        String
  description String
  before      Json?
  after       Json?
  created_at  DateTime @default(now())
}
```

#### 6. Files (Arquivos)
```prisma
model Files {
  id         Int       @id @default(autoincrement())
  url        String
  created_at DateTime  @default(now())
  name       String?
  updated_at DateTime? @default(now())
}
```

## 🔐 Sistema de Autenticação

### 1. Login (`/api/pg/login.ts`)
```typescript
import bcrypt from 'bcryptjs'
import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  const { email, password } = req.body;
  
  const userExists = await prisma.users.findFirst({
    where: { email }
  });

  if (!userExists) throw new Error('EMAIL_NOT_FOUND');
  
  const isPasswordValid = await bcrypt.compare(password, userExists.password);
  if (!isPasswordValid) throw new Error('SENHA_INVALIDA');

  return res.status(200).json(userExists);
}
```

### 2. Middleware de Autenticação (`withSSRAuthRedirect.ts`)
```typescript
export function withSSRAuthRedirect<P>(fn: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext) => {
    const cookies = parseCookies(ctx);
    
    if (cookies["nextAuth.contemp"]) {
      return {
        redirect: {
          destination: "/adm/home",
          permanent: false,
        },
      };
    }
    
    return await fn(ctx);
  };
}
```

## 📡 APIs Principais

### 1. CRUD de Produtos

#### Listar Produtos (`getAllProductsWidthCategory.ts`)
```typescript
const products = await prisma.products.findMany({
  include: { category: true },
  orderBy: { order: 'asc' }
})
```

#### Criar Produto (`saveProduct.ts`)
```typescript
await prisma.products.create({
  data: {
    description: body.description,
    name: body.name,
    category_id: body.category,
    // ... outros campos
  }
})
```

#### Atualizar Produto (`updateProduct.ts`)
```typescript
await prisma.products.update({
  where: { id: body.id },
  data: {
    description: body.description,
    name: body.name,
    // ... outros campos
  }
})
```

#### Deletar Produto (`deleteProduct.ts`)
```typescript
await prisma.products.delete({
  where: { id: body.id }
})
```

### 2. CRUD de Categorias

#### Listar Categorias (`getAllCategory.ts`)
```typescript
const categories = await prisma.categories.findMany()
```

#### Criar Categoria (`saveCategory.ts`)
```typescript
await prisma.categories.create({
  data: {
    name: body.name,
    description: body.description,
    order: getLastOrder.order + 1,
    // ... outros campos
  }
})
```

### 3. CRUD de Banners

#### Listar Banners (`getAllBanners.ts`)
```typescript
const banners = await prisma.banners.findMany({
  where: {
    type: tabActive,
    status: true
  }
})
```

#### Criar Banner (`createBanner.ts`)
```typescript
await prisma.banners.create({
  data: {
    url: url_file,
    type,
    title,
    order: getLastOrder ? getLastOrder.order + 1 : 1,
    // ... outros campos
  }
})
```

### 4. Upload de Arquivos (`upload.ts`)
```typescript
const upload = multer({
  storage: multer.diskStorage({
    destination: '/var/www/html/arquivos',
    filename: (req, file, cb) => {
      const slugifiedName = createSlug(file.originalname);
      cb(null, slugifiedName);
    },
  }),
  limits: { fileSize: 1073741824 }, // 1GB
});
```

## 🎨 Frontend - Componentes Principais

### 1. Layout Principal (`_app.tsx`)
```typescript
import { ChakraProvider } from "@chakra-ui/react"
import { AuthProvider } from "../contextAuth/authContext"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ChakraProvider>
  );
}
```

### 2. Context de Autenticação (`authContext.tsx`)
```typescript
const UserAuthContext = createContext({} as UserAuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
  const [cart, setCart] = useState<any>([])
  const [loading, setLoading] = useState<any>(true)
  
  // Lógica do carrinho e autenticação
  
  return (
    <UserAuthContext.Provider value={{...}}>
      {children}
    </UserAuthContext.Provider>
  )
}
```

### 3. Página de Login (`/adm/index.tsx`)
```typescript
const signIn = async () => {
  const {data} = await api.post(`login`, { 
    email: body.email, 
    password: body.password 
  })
  
  setCookie(undefined, 'nextAuth.contemp', JSON.stringify({
    data, body,
  }))
  
  router.push('/adm/home')
}
```

## 🔧 Configurações Importantes

### 1. Axios (`lib/axios.ts`)
```typescript
const api = axios.create({
  baseURL: '/api/pg',
  timeout: 300000, // 5 minutos
})

// Interceptor para fallback automático
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    if (error.response?.status === 404 && !config.__isRetryRequest) {
      config.__isRetryRequest = true
      config.baseURL = '/api'
      return axios(config)
    }
    return Promise.reject(error)
  }
)
```

### 2. Prisma (`lib/prisma.ts`)
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({})
```

### 3. Next.js Config (`next.config.js`)
```javascript
module.exports = {
  reactStrictMode: false,
  compress: true,
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'seu-dominio.com',
    ],
  },
  async headers() {
    return [
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};
```

## 📦 Dependências Principais

### Package.json - Dependências Essenciais
```json
{
  "dependencies": {
    "@chakra-ui/react": "^2.8.2",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@prisma/client": "4.10.1",
    "antd": "5.6.0",
    "axios": "^1.3.3",
    "bcryptjs": "^2.4.3",
    "chart.js": "^4.5.0",
    "framer-motion": "^10.16.16",
    "multer": "^1.4.5-lts.1",
    "next": "12.3.1",
    "next-connect": "0.9.1",
    "nookies": "^2.5.2",
    "pg": "8.8.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-hook-form": "7.27.1",
    "sib-api-v3-sdk": "8.5.0",
    "swiper": "8.4.4",
    "typescript": "4.8.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/multer": "^1.4.7",
    "@types/node": "^18.11.18",
    "@types/react": "^18.2.37",
    "eslint": "8.25.0",
    "eslint-config-next": "12.3.1",
    "prisma": "^4.10.1"
  }
}
```

## 🚀 Processo de Implementação

### 1. Setup Inicial
```bash
# Criar projeto Next.js
npx create-next-app@latest meu-projeto --typescript

# Instalar dependências
npm install @chakra-ui/react @emotion/react @emotion/styled
npm install @prisma/client prisma
npm install axios bcryptjs multer next-connect
npm install antd react-hook-form sib-api-v3-sdk
npm install -D @types/bcryptjs @types/multer
```

### 2. Configurar Prisma
```bash
# Inicializar Prisma
npx prisma init

# Configurar schema.prisma
# Executar migrações
npx prisma migrate dev

# Gerar cliente
npx prisma generate
```

### 3. Estrutura de Pastas
```bash
mkdir -p src/pages/adm
mkdir -p src/pages/api/pg
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/contextAuth
mkdir -p src/utils
mkdir -p src/styles
```

### 4. Configurar Variáveis de Ambiente
```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
SENDBLUE="sua-api-key-sendinblue"
STATUS="PROD" # ou "HMG"
```

## 📊 Funcionalidades Administrativas

### 1. Dashboard Principal
- Visão geral de produtos, categorias, banners
- Estatísticas de acesso
- Logs de atividades
- Gráficos de performance

### 2. Gestão de Conteúdo
- CRUD de produtos com categorias
- Upload de imagens e arquivos
- Editor de texto rico (SunEditor)
- SEO e meta tags

### 3. Gestão de Banners
- Upload de banners
- Agendamento de exibição
- Controle de ordem
- Status ativo/inativo

### 4. Sistema de Logs
- Registro de todas as ações
- Filtros por usuário/data
- Exportação de relatórios
- Auditoria completa

### 5. Gestão de Usuários
- Criação de usuários
- Controle de permissões
- Super administradores
- Perfis de acesso

## 🔒 Segurança

### 1. Autenticação
- Senhas criptografadas com bcrypt
- Cookies seguros
- Middleware de proteção de rotas
- Timeout de sessão

### 2. Upload de Arquivos
- Validação de tipos
- Limite de tamanho
- Sanitização de nomes
- Armazenamento seguro

### 3. APIs
- Validação de entrada
- Tratamento de erros
- Rate limiting
- CORS configurado

## 📈 Monitoramento e Logs

### 1. Sistema de Logs
```typescript
await prisma.logs.create({
  data: {
    user: userEmail,
    description: `Ação realizada: ${acao}`,
    before: dadosAnteriores,
    after: dadosNovos
  }
})
```

### 2. Relatórios
- Exportação CSV/Excel
- Relatórios em PDF
- Gráficos de analytics
- Métricas de performance

## 🎯 Próximos Passos

### 1. Implementação Básica
1. Setup do projeto Next.js
2. Configuração do Prisma
3. Implementação do sistema de auth
4. CRUD básico de produtos/categorias

### 2. Funcionalidades Avançadas
1. Upload de arquivos
2. Sistema de banners
3. Logs e relatórios
4. Gestão de usuários

### 3. Otimizações
1. Cache e performance
2. SEO e meta tags
3. Analytics e tracking
4. Backup e segurança

## 📝 Notas Importantes

### 1. Para Desenvolvimento
- Use TypeScript para type safety
- Implemente validação de dados
- Teste todas as funcionalidades
- Documente APIs

### 2. Para Produção
- Configure HTTPS
- Implemente backup automático
- Monitore logs e erros
- Otimize performance

### 3. Manutenção
- Atualize dependências regularmente
- Monitore uso de recursos
- Faça backup do banco
- Documente mudanças

---

**Este documento serve como guia completo para implementar um projeto similar ao Contemp, com todas as funcionalidades necessárias para um site com painel administrativo robusto.** 