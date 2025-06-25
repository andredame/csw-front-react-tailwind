"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Building, Users, Calendar, BookOpen, Settings, LogOut } from "lucide-react"
import Image from "next/image"

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
    <nav className="bg-white shadow-lg border-b border-gray-200 wave-container relative">
      {/* Subtle wave decoration */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-red-600 to-yellow-600 opacity-60"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between py-4">
          {/* Brand with Coat of Arms */}
          <div className="flex items-center space-x-3">
            <div className="heraldic-emblem">
              <Image
                src="/images/coat-of-arms.png"
                alt="SARC Coat of Arms"
                width={40}
                height={40}
                className="coat-of-arms"
              />
            </div>
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-red-600 to-yellow-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              SARC
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/" isActive={isActive("/")} icon={<Calendar className="w-4 h-4" />}>
              Dashboard
            </NavLink>


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
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-700">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.roles?.join(", ")}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
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
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-r from-blue-100 to-red-100 text-blue-700 shadow-sm"
          : "text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50"
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
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-r from-blue-100 to-red-100 text-blue-700"
          : "text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50"
      }`}
    >
      {children}
    </Link>
  )
}
