"use client"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import WavePattern from "./WavePattern"

const Navbar = () => {
  const { user, logout, isAuthenticated, hasRole, hasAnyRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  if (!isAuthenticated) {
    return null
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-lg border-b-2 border-blue-100 wave-container relative glass-card fade-in">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between py-4">
          {/* Brand with SARC colors */}
          <div className="navbar-brand">
            <Link
              to="/"
              className="text-2xl font-bold hover:opacity-80 transition-all duration-300 flex items-center gap-3 floating"
            >
              <div className="sarc-emblem w-12 h-12 rounded-full flex items-center justify-center">
                <img src="/images/heraldic-emblem.png" alt="SARC Emblem" className="w-8 h-8 object-contain" />
              </div>
              <span className="sarc-gradient-text font-bold">SARC</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to="/" isActive={isActive("/")} label="Dashboard" />

            {hasAnyRole(["ADMIN", "COORDENADOR"]) && (
              <NavLink to="/predios" isActive={isActive("/predios")} label="Prédios" />
            )}

            {hasAnyRole(["PROFESSOR", "COORDENADOR"]) && (
              <NavLink to="/turmas" isActive={isActive("/turmas")} label="Turmas" />
            )}

            {hasRole("PROFESSOR") && (
              <>
                <NavLink to="/aulas" isActive={isActive("/aulas")} label="Aulas" />
                <NavLink to="/reservas" isActive={isActive("/reservas")} label="Reservas" />
              </>
            )}

            {hasAnyRole(["ADMIN", "COORDENADOR"]) && (
              <NavLink to="/recursos" isActive={isActive("/recursos")} label="Recursos" />
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 font-medium hidden sm:block">
              Olá, <span className="text-blue-700 font-semibold">{user?.username}</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-red-50 hover:to-red-100 text-gray-700 hover:text-red-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 hover:border-red-200 hover:transform hover:-translate-y-0.5"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            <MobileNavLink to="/" isActive={isActive("/")} label="Dashboard" />

            {hasAnyRole(["ADMIN", "COORDENADOR"]) && (
              <MobileNavLink to="/predios" isActive={isActive("/predios")} label="Prédios" />
            )}

            {hasAnyRole(["PROFESSOR", "COORDENADOR"]) && (
              <MobileNavLink to="/turmas" isActive={isActive("/turmas")} label="Turmas" />
            )}

            {hasRole("PROFESSOR") && (
              <>
                <MobileNavLink to="/aulas" isActive={isActive("/aulas")} label="Aulas" />
                <MobileNavLink to="/reservas" isActive={isActive("/reservas")} label="Reservas" />
              </>
            )}

            {hasAnyRole(["ADMIN", "COORDENADOR"]) && (
              <MobileNavLink to="/recursos" isActive={isActive("/recursos")} label="Recursos" />
            )}
          </div>
        </div>
      </div>

      {/* Wave decoration with SARC colors */}
      <WavePattern className="navbar-wave" color="rgba(30, 64, 175, 0.1)" opacity={0.3} height={30} variant="gentle" />
    </nav>
  )
}

// Enhanced NavLink with SARC colors
const NavLink = ({ to, isActive, label }) => (
  <Link
    to={to}
    className={`nav-item px-4 py-2 rounded-lg font-medium transition-all duration-300 relative overflow-hidden ${
      isActive
        ? "sarc-nav-active text-blue-700 shadow-sm font-semibold active"
        : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
    }`}
  >
    {label}
  </Link>
)

// Enhanced MobileNavLink with SARC colors
const MobileNavLink = ({ to, isActive, label }) => (
  <Link
    to={to}
    className={`nav-item px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
      isActive
        ? "sarc-nav-active text-blue-700 font-semibold active"
        : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
    }`}
  >
    {label}
  </Link>
)

export default Navbar
