"use client"

import type React from "react"

import { useState, useEffect } from "react" // Importar useState e useEffect para o estado das estatísticas
import { useAuth } from "@/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, User, Loader2, Clock } from "lucide-react" // Importar Loader2
import Navbar from "./navbar"
import api from "../src/services/api" // Importar a instância Axios para as chamadas da API
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Dashboard() {
  const { user } = useAuth()
  const [aulas, setAulas] = useState<any[]>([])
  const [loadingAulas, setLoadingAulas] = useState(true)
  const [aulasError, setAulasError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAulas = async () => {
      setLoadingAulas(true)
      setAulasError(null)
      try {
        const response = await api.get("/api/aulas")
        setAulas(response.data)
      } catch (err: any) {
        console.error("Erro ao carregar aulas:", err)
        setAulasError("Falha ao carregar aulas.")
      } finally {
        setLoadingAulas(false)
      }
    }

    fetchAulas()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 wave-container relative">
      {/* Background Wave Patterns */}
      <div className="wave-background">
        <div className="wave-pattern wave-pattern-1"></div>
        <div className="wave-pattern wave-pattern-2"></div>
        <div className="wave-pattern wave-pattern-3"></div>
      </div>

      <Navbar />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome Section with User Icon */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center shadow-lg floating">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-red-600 to-yellow-600 bg-clip-text text-transparent mb-2">
                Bem-vindo ao SARC
              </h1>
              <p className="text-xl text-gray-700 mb-2">
                Olá, <span className="font-semibold text-blue-600">{user?.username}</span>
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {user?.roles
                  ?.filter(
                    (role) =>
                      // Filtra para incluir apenas os roles de negócio desejados
                      ["PROFESSOR", "ADMIN", "COORDENADOR", "ALUNO"].includes(role.toUpperCase()) &&
                      // Exclui roles técnicos como 'default-roles-sarc', 'offline_access', 'uma_authorization'
                      !["default-roles-sarc", "offline_access", "uma_authorization"].includes(role.toLowerCase()),
                  )
                  .map((role, index) => (
                    <span
                      key={role}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        role === "ADMIN"
                          ? "bg-red-100 text-red-700"
                          : role === "COORDENADOR"
                            ? "bg-blue-100 text-blue-700"
                            : role === "PROFESSOR"
                              ? "bg-green-100 text-green-700"
                              : "bg-purple-100 text-purple-700" // Cor padrão para ALUNO ou outros roles de negócio
                      }`}
                    >
                      {role}
                    </span>
                  ))}
              </div>
            </div>
          </div>
          <div className="w-full h-1 bg-gradient-to-r from-blue-600 via-red-600 to-yellow-600 rounded-full opacity-60"></div>
        </div>

        {/* Próximas Aulas */}
        <Card className="sarc-card backdrop-blur-sm bg-white/95 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-red-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Próximas Aulas</CardTitle>
                  <CardDescription>Suas aulas programadas para os próximos dias</CardDescription>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href="/aulas">Ver todas</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingAulas ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="ml-2 text-gray-700">Carregando aulas...</p>
              </div>
            ) : aulasError ? (
              <Alert variant="destructive">
                <AlertDescription>{aulasError}</AlertDescription>
              </Alert>
            ) : aulas.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Nenhuma aula programada</p>
                <p className="text-sm text-gray-500 mt-2">Suas próximas aulas aparecerão aqui</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aulas
                  
                  .sort((a: { data: string; periodo: string }, b: { data: string; periodo: string }) => {
                    // Sort by date, then by period
                    const dateA = new Date(a.data + "T00:00:00")
                    const dateB = new Date(b.data + "T00:00:00")
                    if (dateA.getTime() !== dateB.getTime()) {
                      return dateA.getTime() - dateB.getTime()
                    }
                    // If same date, sort by period
                    const periodOrder: { [key: string]: number } = { MANHA: 1, TARDE: 2, NOITE: 3 }
                    return (periodOrder[a.periodo] || 4) - (periodOrder[b.periodo] || 4)
                  })
                  .slice(0, 6)
                  .map((aula) => (
                    <UpcomingClassCard key={aula.id} aula={aula} />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface UpcomingClassCardProps {
  aula: any
}

function UpcomingClassCard({ aula }: UpcomingClassCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString + "T00:00:00")
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    today.setHours(0, 0, 0, 0)
    tomorrow.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)

    if (date.getTime() === today.getTime()) {
      return "Hoje"
    } else if (date.getTime() === tomorrow.getTime()) {
      return "Amanhã"
    } else {
      return date.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      })
    }
  }
 const getPeriodTime = (periodo: string) => {
    switch (periodo) {
      case "AB":
        return "08:00 - 12:00"
      case "CD":
        return "14:00 - 18:00"
      case "JK":
        return "17:30 - 19:00"
      case "LM":
        return "19:15 - 20:25"
      case "NP":
        return "21:00 - 22:30"
      default:
        return "Horário não definido"
    }
  }

  const getPeriodColor = (periodo: string) => {
    switch (periodo) {
      case "MANHA":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "TARDE":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "NOITE":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="sarc-card hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg mb-1">{aula.turma?.numero || "Turma N/A"}</h3>
            <p className="text-sm text-gray-600">{aula.turma?.disciplina?.nome || "Disciplina não informada"}</p>
          </div>
          <Badge variant="outline" className={`${getPeriodColor(aula.periodo)} font-medium`}>
            {aula.periodo || "N/A"}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            <span className="font-medium">{formatDate(aula.data)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-green-500" />
            <span>{getPeriodTime(aula.periodo)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <span>{aula.sala?.nome || "Sala não definida"}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{aula.sala?.predio?.nome || "Prédio não informado"}</span>
           
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface QuickActionCardProps {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color: "blue" | "green" | "purple" | "orange" | "red"
}

function QuickActionCard({ title, description, href, icon, color }: QuickActionCardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    orange: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
    red: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
  }

  return (
    <Card className="sarc-card hover:shadow-lg transition-all duration-300 hover:scale-105 group cursor-pointer backdrop-blur-sm bg-white/90">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div
            className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{description}</p>
            <Button asChild size="sm" className="sarc-button-primary">
              <Link href={href}>Acessar</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
