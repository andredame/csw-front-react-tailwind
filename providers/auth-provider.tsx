"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/auth-utils"

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
  loading: boolean
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        return { success: true }
      } else {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.message || "Erro ao fazer login",
        }
      }
    } catch (error) {
      return {
        success: false,
        error: "Erro de conexão. Tente novamente.",
      }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      router.push("/login")
    }
  }

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some((role) => hasRole(role))
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
    hasRole,
    hasAnyRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
