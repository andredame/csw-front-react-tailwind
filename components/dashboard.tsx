"use client"

import type React from "react"

import { useState, useEffect } from "react" // Importar useState e useEffect para o estado das estatísticas
import { useAuth } from "@/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building, Users, Calendar, BookOpen, Settings, TrendingUp, Clock, MapPin, User, Loader2 } from "lucide-react" // Importar Loader2
import Navbar from "./navbar"
import api from "../src/services/api" // Importar a instância Axios para as chamadas da API


export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    predios: '...',
    salas: '...',
    turmas: '...',
    aulas: '...',
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);


  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setStatsError(null);
      try {
        // Exemplo de como você chamaria seus novos endpoints de contagem
        const [
          prediosRes,
          salasRes,
          turmasRes,
          aulasRes
        ] = await Promise.all([
          api.get("/api/predios/count"), // Substitua pelo seu endpoint real
          api.get("/api/salas/count"),   // Substitua pelo seu endpoint real
          api.get("/api/turmas/count"),   // Substitua pelo seu endpoint real
          api.get("/api/aulas/count")    // Substitua pelo seu endpoint real
        ]);

        setStats({
          predios: prediosRes.data.toString(),
          salas: salasRes.data.toString(),
          turmas: turmasRes.data.toString(),
          aulas: aulasRes.data.toString(),
        });
      } catch (err) {
        console.error("Erro ao carregar estatísticas do dashboard:", err);
        setStatsError("Falha ao carregar estatísticas.");
        setStats({
          predios: 'N/A',
          salas: 'N/A',
          turmas: 'N/A',
          aulas: 'N/A',
        });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []); // Array de dependências vazio para rodar apenas uma vez


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
                {user?.roles?.filter(role => 
                  // Filtra para incluir apenas os roles de negócio desejados
                  ["PROFESSOR", "ADMIN", "COORDENADOR", "ALUNO"].includes(role.toUpperCase()) &&
                  // Exclui roles técnicos como 'default-roles-sarc', 'offline_access', 'uma_authorization'
                  !["default-roles-sarc", "offline_access", "uma_authorization"].includes(role.toLowerCase())
                ).map((role, index) => (
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loadingStats ? (
            // Exibir esqueletos ou loading indicators enquanto os dados carregam
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Prédios"
                value={stats.predios}
                description="Prédios cadastrados"
                icon={<Building className="w-8 h-8" />}
                color="blue"
                trend="+2 este mês" // Estes trends ainda são fixos
              />
              <StatsCard
                title="Salas"
                value={stats.salas}
                description="Salas disponíveis"
                icon={<MapPin className="w-8 h-8" />}
                color="green"
                trend="100% ocupação" // Estes trends ainda são fixos
              />
              <StatsCard
                title="Turmas"
                value={stats.turmas}
                description="Turmas ativas"
                icon={<Users className="w-8 h-8" />}
                color="purple"
                trend="+3 novas" // Estes trends ainda são fixos
              />
              <StatsCard
                title="Aulas"
                value={stats.aulas}
                description="Aulas agendadas"
                icon={<Calendar className="w-8 h-8" />}
                color="orange"
                trend="Esta semana" // Estes trends ainda são fixos
              />
            </>
          )}
          {statsError && <div className="col-span-full text-center text-red-600 text-sm">{statsError}</div>}
        </div>

        {/* Quick Actions */}
        <Card className="sarc-card backdrop-blur-sm bg-white/95 shadow-xl">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-red-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">Acesso Rápido</CardTitle>
                <CardDescription>Navegue rapidamente para as principais funcionalidades</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user?.roles?.includes("ADMIN") || user?.roles?.includes("COORDENADOR") ? (
                <QuickActionCard
                  title="Gerenciar Prédios"
                  description="Administrar prédios e salas do campus"
                  href="/predios"
                  icon={<Building className="w-6 h-6" />}
                  color="blue"
                />
              ) : null}

              {user?.roles?.includes("PROFESSOR") || user?.roles?.includes("COORDENADOR") ? (
                <QuickActionCard
                  title="Minhas Turmas"
                  description="Visualizar e gerenciar turmas atribuídas"
                  href="/turmas"
                  icon={<Users className="w-6 h-6" />}
                  color="green"
                />
              ) : null}

              {user?.roles?.includes("PROFESSOR") ? (
                <>
                  <QuickActionCard
                    title="Minhas Aulas"
                    description="Gerenciar cronograma de aulas"
                    href="/aulas"
                    icon={<BookOpen className="w-6 h-6" />}
                    color="purple"
                  />
                  <QuickActionCard
                    title="Reservas"
                    description="Reservar recursos para aulas"
                    href="/reservas"
                    icon={<Clock className="w-6 h-6" />}
                    color="orange"
                  />
                </>
              ) : null}

              {user?.roles?.includes("ADMIN") || user?.roles?.includes("COORDENADOR") ? (
                <QuickActionCard
                  title="Recursos"
                  description="Gerenciar equipamentos e materiais"
                  href="/recursos"
                  icon={<Settings className="w-6 h-6" />}
                  color="red"
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
  trend: string
}

function StatsCard({ title, value, description, icon, color, trend }: StatsCardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  }

  const bgClasses = {
    blue: "from-blue-50 to-blue-100",
    green: "from-green-50 to-green-100",
    purple: "from-purple-50 to-purple-100",
    orange: "from-orange-50 to-orange-100",
  }

  return (
    <Card
      className={`sarc-card backdrop-blur-sm bg-gradient-to-br ${bgClasses[color]} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg`}>{icon}</div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-600 font-medium">{trend}</p>
          </div>
        </div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">{title}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente de Esqueleto para as estatísticas (copiado da última versão)
function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
          <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
        </div>
      </CardContent>
    </Card>
  );
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