"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Building, Users, Calendar, BookOpen, Settings } from "lucide-react"

export default function Navbar() {
  const { user, logout, isAuthenticated, hasRole, hasAnyRole } = useAuth()
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
  }

  if (!isAuthenticated) {
    return null
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
              SARC
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/" isActive={isActive("/")} icon={<Calendar className="w-4 h-4" />}>
              Dashboard
            </NavLink>

            {hasAnyRole(["ADMIN", "COORDENADOR"]) && (
              <NavLink href="/predios" isActive={isActive("/predios")} icon={<Building className="w-4 h-4" />}>
                Prédios
              </NavLink>
            )}

            {hasAnyRole(["PROFESSOR", "COORDENADOR"]) && (
              <NavLink href="/turmas" isActive={isActive("/turmas")} icon={<Users className="w-4 h-4" />}>
                Turmas
              </NavLink>
            )}

            {hasRole("PROFESSOR") && (
              <>
                <NavLink href="/aulas" isActive={isActive("/aulas")} icon={<BookOpen className="w-4 h-4" />}>
                  Aulas
                </NavLink>
                <NavLink href="/reservas" isActive={isActive("/reservas")} icon={<Calendar className="w-4 h-4" />}>
                  Reservas
                </NavLink>
              </>
            )}

            {hasAnyRole(["ADMIN", "COORDENADOR"]) && (
              <NavLink href="/recursos" isActive={isActive("/recursos")} icon={<Settings className="w-4 h-4" />}>
                Recursos
              </NavLink>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              Olá, <span className="font-semibold text-blue-600">{user?.username}</span>
            </span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Sair
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            <MobileNavLink href="/" isActive={isActive("/")}>
              Dashboard
            </MobileNavLink>

            {hasAnyRole(["ADMIN", "COORDENADOR"]) && (
              <MobileNavLink href="/predios" isActive={isActive("/predios")}>
                Prédios
              </MobileNavLink>
            )}

            {hasAnyRole(["PROFESSOR", "COORDENADOR"]) && (
              <MobileNavLink href="/turmas" isActive={isActive("/turmas")}>
                Turmas
              </MobileNavLink>
            )}

            {hasRole("PROFESSOR") && (
              <>
                <MobileNavLink href="/aulas" isActive={isActive("/aulas")}>
                  Aulas
                </MobileNavLink>
                <MobileNavLink href="/reservas" isActive={isActive("/reservas")}>
                  Reservas
                </MobileNavLink>
              </>
            )}

            {hasAnyRole(["ADMIN", "COORDENADOR"]) && (
              <MobileNavLink href="/recursos" isActive={isActive("/recursos")}>
                Recursos
              </MobileNavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

interface NavLinkProps {
  href: string
  isActive: boolean
  children: React.ReactNode
  icon?: React.ReactNode
}

function NavLink({ href, isActive, children, icon }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}

function MobileNavLink({ href, isActive, children }: Omit<NavLinkProps, "icon">) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </Link>
  )
}
