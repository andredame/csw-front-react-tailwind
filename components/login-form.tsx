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
    <div className="w-full max-w-md space-y-6">
      {/* Logo/Brand */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center mb-4">
          <span className="text-white font-bold text-2xl">S</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">SARC</h1>
        <p className="text-gray-600 mt-2">Sistema de Alocação de Recursos e Controle</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Digite suas credenciais para acessar o sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Email</Label>
              <Input
                id="username"
                name="username"
                type="email"
                value={formData.username}
                onChange={handleChange}
                placeholder="seu.email@edu.pucrs.br"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Digite sua senha"
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Usuários de exemplo:</p>
              <ul className="space-y-1 text-xs">
                <li>
                  <strong>Admin:</strong> edgardossantos@edu.pucrs.br
                </li>
                <li>
                  <strong>Coordenador:</strong> mariaeduarda@edu.pucrs.br
                </li>
                <li>
                  <strong>Professor:</strong> john@edu.pucrs.br
                </li>
                <li>
                  <strong>Aluno:</strong> andresilva@edu.pucrs.br
                </li>
              </ul>
              <p className="mt-2 text-xs text-gray-500">Senha padrão: 123456</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
