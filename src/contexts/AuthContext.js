"use client"

import { createContext, useContext, useState, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  // Initialize token as null to avoid localStorage access during SSR
  const [token, setToken] = useState(null) //
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // This effect runs only on the client side after initial render
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null; //
    if (storedToken) {
      setToken(storedToken); // Update the state with the stored token
      // Decode the JWT token to get user information
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1])) //
        const userInfo = {
          id: payload.sub, //
          username: payload.preferred_username, //
          email: payload.email, //
          roles: payload.realm_access?.roles || [], //
        }
        setUser(userInfo) //
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}` //
      } catch (error) {
        console.error("Erro ao decodificar token:", error) //
        logout() //
      }
    }
    setLoading(false) //
  }, []) // Empty dependency array means this runs once on mount

  const login = async (username, password) => {
    try {
      const response = await api.post("/api/auth/login", {
        username,
        password,
      })

      const { access_token } = response.data

      if (typeof window !== 'undefined') { //
        localStorage.setItem("token", access_token) //
      }
      setToken(access_token) //

      return { success: true }
    } catch (error) {
      console.error("Erro no login:", error) //
      return {
        success: false, //
        error: error.response?.data?.message || "Erro ao fazer login", //
      }
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') { //
      localStorage.removeItem("token") //
    }
    setToken(null) //
    setUser(null) //
    delete api.defaults.headers.common["Authorization"] //
  }

  const hasRole = (role) => {
    return user?.roles?.includes(role) || false //
  }

  const hasAnyRole = (roles) => {
    return roles.some((role) => hasRole(role)) //
  }

  const value = {
    user, //
    token, //
    login, //
    logout, //
    hasRole, //
    hasAnyRole, //
    isAuthenticated: !!token && !!user, // isAuthenticated now depends on client-side token //
  }

  if (loading) {
    return (
      <div className="loading">
        <h3>Carregando...</h3>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider> //
}