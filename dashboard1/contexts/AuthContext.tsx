"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface AuthContextType {
  token: string | null
  setToken: (token: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  const handleSetToken = (newToken: string | null) => {
    setToken(newToken)
    if (newToken) {
      localStorage.setItem("token", newToken)
    } else {
      localStorage.removeItem("token")
    }
  }

  return (
    <AuthContext.Provider value={{ token, setToken: handleSetToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
