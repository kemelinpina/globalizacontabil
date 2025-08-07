import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  name: string
  email: string
  picture?: string
  super_adm: boolean
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Verificar se há um usuário logado ao carregar a página
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Verificar se há um token no localStorage
      const token = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')

      if (token && savedUser) {
        try {
          // Tentar fazer uma requisição para verificar se o token ainda é válido
          const response = await fetch('/api/pg/check-auth', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const userData = await response.json()
            setUser(userData.user)
            // Atualizar dados salvos
            localStorage.setItem('auth_user', JSON.stringify(userData.user))
          } else {
            // Token inválido, limpar dados
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
          }
        } catch (error) {
          // Se não conseguir verificar online, usar dados salvos
          console.log('Usando dados salvos localmente')
          setUser(JSON.parse(savedUser))
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/pg/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Retornar false em vez de throw error para evitar o erro do Next.js
        console.error('Erro no login:', data.message || 'Email ou senha incorretos')
        return false
      }

      // Salvar token e dados do usuário
      localStorage.setItem('auth_token', data.token || 'dummy_token')
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      setUser(data.user)

      return true
    } catch (error) {
      console.error('Erro no login:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
} 