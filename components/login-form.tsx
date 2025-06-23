"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export default function LoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await login(formData.username, formData.password)

    if (result.success) {
      router.push("/")
    } else {
      setError(result.error || "Erro ao fazer login")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center wave-container relative">
      {/* Animated Wave Background */}
      <div className="wave-background">
        <div className="wave-pattern wave-pattern-1"></div>
        <div className="wave-pattern wave-pattern-2"></div>
        <div className="wave-pattern wave-pattern-3"></div>
      </div>

      {/* Wave Shapes */}
      <div className="absolute top-0 left-0 w-full wave-shape"></div>
      <div className="absolute bottom-0 left-0 w-full wave-shape-reverse"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Heraldic Emblem */}
        <div className="text-center">
          <div className="heraldic-emblem mx-auto mb-6 floating">
            <Image
              src="/images/coat-of-arms.png"
              alt="SARC Coat of Arms"
              width={120}
              height={120}
              className="coat-of-arms"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-red-600 to-yellow-600 bg-clip-text text-transparent mb-2">
            SARC
          </h1>
          <p className="text-gray-600 font-medium">Sistema de Alocação de Recursos e Controle</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-red-600 mx-auto mt-3 rounded-full"></div>
        </div>

        <Card className="sarc-card backdrop-blur-sm bg-white/95 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Entrar</CardTitle>
            <CardDescription>Digite suas credenciais para acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 font-medium">
                  Email
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="email"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="seu.email@edu.pucrs.br"
                  required
                  disabled={loading}
                  className="sarc-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Senha
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  required
                  disabled={loading}
                  className="sarc-input"
                />
              </div>

              <Button type="submit" className="w-full sarc-button-primary" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-3 text-center text-gray-700">Usuários de exemplo:</p>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                    <span className="font-medium text-blue-800">Admin:</span>
                    <span className="text-blue-600">edgardossantos@edu.pucrs.br</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                    <span className="font-medium text-red-800">Coordenador:</span>
                    <span className="text-red-600">mariaeduarda@edu.pucrs.br</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                    <span className="font-medium text-green-800">Professor:</span>
                    <span className="text-green-600">john@edu.pucrs.br</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                    <span className="font-medium text-purple-800">Aluno:</span>
                    <span className="text-purple-600">andresilva@edu.pucrs.br</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-center text-gray-500 font-medium">
                  Senha padrão: <span className="font-mono bg-gray-100 px-2 py-1 rounded">123456</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
