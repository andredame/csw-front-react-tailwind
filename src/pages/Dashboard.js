"use client"
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card"
import WavePattern from "../components/WavePattern"

const Dashboard = ({ user }) => {
  return (
    <div className="min-h-screen sarc-bg-primary wave-container relative">
      {/* Background waves with SARC colors */}
      <WavePattern
        className="page-wave-1"
        color="rgba(30, 64, 175, 0.02)"
        opacity={0.02}
        height={100}
        variant="default"
      />
      <WavePattern
        className="page-wave-2"
        color="rgba(220, 38, 38, 0.015)"
        opacity={0.015}
        height={80}
        variant="gentle"
      />
      <WavePattern
        className="page-wave-3"
        color="rgba(30, 64, 175, 0.025)"
        opacity={0.025}
        height={90}
        variant="smooth"
      />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header with emblem */}
        <div className="text-center mb-8 fade-in">
          <div className="sarc-emblem w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center floating">
            <img src="/images/heraldic-emblem.png" alt="SARC Emblem" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-4xl font-bold sarc-gradient-text mb-2">SARC</h1>
          <p className="text-gray-600 font-medium">Sistema de Alocação de Recursos e Controle</p>
        </div>

        {/* Welcome Section */}
        <Card withWaves variant="gradient" className="mb-8 fade-in">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sarc-gradient-primary rounded-full flex items-center justify-center shadow-lg floating text-white font-bold text-xl">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle>Bem-vindo, {user?.username}!</CardTitle>
                <p className="text-gray-600">Perfil</p>
                <p className="font-semibold text-blue-700 text-lg">{user?.role}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Email:</p>
            <p className="font-medium text-blue-700">{user?.email}</p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card
            variant="stat"
            className="text-center slide-up hover:transform hover:-translate-y-1"
            style={{ animationDelay: "0.2s" }}
          >
            <CardContent className="pt-8 pb-8">
              <div className="text-5xl font-bold sarc-gradient-text mb-3 floating">5</div>
              <p className="text-gray-600 font-semibold">Prédios</p>
              <div className="w-12 h-1 sarc-gradient-primary rounded-full mx-auto mt-2"></div>
            </CardContent>
          </Card>

          <Card
            variant="stat"
            className="text-center slide-up hover:transform hover:-translate-y-1"
            style={{ animationDelay: "0.4s" }}
          >
            <CardContent className="pt-8 pb-8">
              <div className="text-5xl font-bold sarc-gradient-text mb-3 floating-delayed">5</div>
              <p className="text-gray-600 font-semibold">Turmas</p>
              <div className="w-12 h-1 sarc-gradient-primary rounded-full mx-auto mt-2"></div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <Card withWaves variant="gradient" className="slide-up" style={{ animationDelay: "0.6s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Acesso Rápido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickAccessButton
                title="Gerenciar Prédios"
                description="Administrar prédios e salas"
                icon="🏢"
                color="blue"
              />
              <QuickAccessButton
                title="Gerenciar Recursos"
                description="Controlar equipamentos e materiais"
                icon="📋"
                color="red"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const QuickAccessButton = ({ title, description, icon, color }) => (
  <button className="sarc-quick-access p-6 text-left rounded-xl transition-all duration-300 group relative overflow-hidden">
    <div className="flex items-center gap-4">
      <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <div>
        <h3
          className={`font-semibold ${color === "blue" ? "text-blue-700" : "text-red-600"} group-hover:text-blue-800 transition-colors duration-300 text-lg`}
        >
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <WavePattern
        className="absolute bottom-0"
        color={color === "blue" ? "rgba(30, 64, 175, 0.05)" : "rgba(220, 38, 38, 0.05)"}
        opacity={0.1}
        height={20}
        variant="smooth"
      />
    </div>
  </button>
)

export default Dashboard
