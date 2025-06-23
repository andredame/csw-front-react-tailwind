"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import WavePattern from "./WavePattern"

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, hasAnyRole } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles.length > 0 && !hasAnyRole(roles)) {
    return (
      <div className="min-h-screen sarc-bg-primary flex items-center justify-center p-4 wave-container relative">
        {/* Background waves with SARC colors */}
        <WavePattern
          className="page-wave-1"
          color="rgba(30, 64, 175, 0.03)"
          opacity={0.03}
          height={80}
          variant="default"
        />
        <WavePattern
          className="page-wave-2"
          color="rgba(220, 38, 38, 0.02)"
          opacity={0.02}
          height={60}
          variant="gentle"
        />
        <WavePattern
          className="page-wave-3"
          color="rgba(30, 64, 175, 0.04)"
          opacity={0.04}
          height={70}
          variant="smooth"
        />

        <div className="max-w-md w-full relative z-10 scale-in">
          {/* Heraldic Emblem */}
          <div className="text-center mb-6 fade-in-down">
            <div className="sarc-emblem w-20 h-20 rounded-full mx-auto flex items-center justify-center">
              <img src="/images/heraldic-emblem.png" alt="SARC Emblem" className="w-12 h-12 object-contain" />
            </div>
          </div>

          <div className="glass-card rounded-2xl shadow-2xl border-2 border-red-200 overflow-hidden wave-container relative">
            <div className="sarc-error-gradient p-6 text-center relative">
              <div className="floating">
                <svg
                  className="w-12 h-12 text-white mx-auto mb-3 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white relative z-10">Acesso Negado</h3>

              {/* Wave decoration */}
              <WavePattern
                className="absolute bottom-0"
                color="rgba(255, 255, 255, 0.2)"
                opacity={0.3}
                height={25}
                variant="gentle"
              />
            </div>
            <div className="p-6 text-center bg-white relative">
              <p className="text-gray-600 mb-6 font-medium">Você não tem permissão para acessar esta página.</p>
              <button
                onClick={() => window.history.back()}
                className="sarc-gradient-button px-8 py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl relative overflow-hidden"
              >
                <span className="relative z-10">Voltar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
