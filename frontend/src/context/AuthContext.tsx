import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { CognitoUser } from 'amazon-cognito-identity-js'
import * as cognito from '@/lib/cognito'

interface AuthContextType {
  user: CognitoUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<string>
  signOut: () => void
  getToken: () => Promise<string>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CognitoUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await cognito.getSession()
        setUser(currentUser)
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    const cognitoUser = await cognito.signIn({ email, password })
    setUser(cognitoUser)
  }

  const signUp = async (email: string, password: string) => {
    return cognito.signUp({ email, password })
  }

  const signOut = () => {
    cognito.signOut()
    setUser(null)
  }

  const getToken = async () => {
    return cognito.getJwtToken()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
