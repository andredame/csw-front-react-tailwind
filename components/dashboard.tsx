"use client"

import type React from "react"

import { useAuth } from "@/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building, Users, Calendar, BookOpen, Settings, User } from "lucide-react"
import Navbar from "./navbar"

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bem-vindo, {user?.username}!</h1>
              <p className="text-gray-600">
                Perfil: <span className="font-semibold text-blue-600">{user?.roles?.join(", ")}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Prédios"
            value="5"
            description="Prédios cadastrados"
            icon={<Building className="w-8 h-8" />}
            color="blue"
          />
          <StatsCard
            title="Salas"
            value="25"
            description="Salas disponíveis"
            icon={<Settings className="w-8 h-8" />}
            color="green"
          />
          <StatsCard
            title="Turmas"
            value="12"
            description="Turmas ativas"
            icon={<Users className="w-8 h-8" />}
            color="purple"
          />
          <StatsCard
            title="Aulas"
            value="48"
            description="Aulas agendadas"
            icon={<Calendar className="w-8 h-8" />}
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>Navegue rapidamente para as principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user?.roles?.includes("ADMIN") || user?.roles?.includes("COORDENADOR") ? (
                <QuickActionCard
                  title="Gerenciar Prédios"
                  description="Administrar prédios e salas"
                  href="/predios"
                  icon={<Building className="w-6 h-6" />}
                />
              ) : null}

              {user?.roles?.includes("PROFESSOR") || user?.roles?.includes("COORDENADOR") ? (
                <QuickActionCard
                  title="Minhas Turmas"
                  description="Visualizar turmas atribuídas"
                  href="/turmas"
                  icon={<Users className="w-6 h-6" />}
                />
              ) : null}

              {user?.roles?.includes("PROFESSOR") ? (
                <>
                  <QuickActionCard
                    title="Minhas Aulas"
                    description="Gerenciar aulas e horários"
                    href="/aulas"
                    icon={<BookOpen className="w-6 h-6" />}
                  />
                  <QuickActionCard
                    title="Reservas"
                    description="Reservar recursos para aulas"
                    href="/reservas"
                    icon={<Calendar className="w-6 h-6" />}
                  />
                </>
              ) : null}

              {user?.roles?.includes("ADMIN") || user?.roles?.includes("COORDENADOR") ? (
                <QuickActionCard
                  title="Recursos"
                  description="Gerenciar equipamentos"
                  href="/recursos"
                  icon={<Settings className="w-6 h-6" />}
                />
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  color: "blue" | "green" | "purple" | "orange"
}

function StatsCard({ title, value, description, icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]} text-white`}>{icon}</div>
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
}

function QuickActionCard({ title, description, href, icon }: QuickActionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">{icon}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            <Button asChild size="sm">
              <Link href={href}>Acessar</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
