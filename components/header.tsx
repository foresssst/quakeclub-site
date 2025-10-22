"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, User, Shield, LogOut } from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationsBell } from "@/components/notifications-bell"

interface HeaderProps {
  isLoggedIn: boolean
  isAdmin: boolean
  username?: string
}

export function Header({ isLoggedIn, isAdmin, username }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Inicio" },
    { href: "/configs", label: "Configs" },
    { href: "/servers", label: "Servidores" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#0a0a0f]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a0a0f]/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.png" alt="Quake Club" width={120} height={40} className="h-10 w-auto" priority />
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-orange-500 flex items-center gap-2 ${
                pathname === item.href ? "text-orange-500" : "text-gray-300"
              }`}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/clanes"
            className={`text-sm font-medium transition-colors hover:text-orange-500 flex items-center gap-2 ${
              pathname === "/clanes" ? "text-orange-500" : "text-gray-300"
            }`}
          >
            Clanes
          </Link>

          {/* Rankings y Noticias destacados */}
          <div className="flex items-center gap-4 ml-2">
            <Link
              href="/rankings"
              className={`relative px-4 py-2 font-bold text-base transition-all duration-300 ${
                pathname === "/rankings"
                  ? "bg-gradient-to-r from-purple-600 to-orange-600 text-white shadow-lg shadow-purple-500/50"
                  : "bg-gradient-to-r from-purple-600/20 to-orange-600/20 text-purple-400 hover:from-purple-600/40 hover:to-orange-600/40 hover:text-white border border-purple-500/30"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                RANKINGS
              </span>
            </Link>

            <Link
              href="/news"
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                pathname === "/news"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-300 hover:text-orange-500"
              }`}
            >
              Noticias
            </Link>
          </div>
        </nav>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <NotificationsBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-orange-600 flex items-center justify-center text-xs font-bold">
                      {username?.[0].toUpperCase()}
                    </div>
                    <span className="hidden md:inline">{username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#0a0a0f] border-gray-800">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                        <Shield className="w-4 h-4" />
                        Panel Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem asChild>
                    <form action="/api/logout" method="POST" className="w-full">
                      <button type="submit" className="flex items-center gap-2 w-full text-left">
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}

          <button className="md:hidden text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-[#0a0a0f]">
          <nav className="container mx-auto flex flex-col space-y-4 px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-orange-500 flex items-center gap-2 ${
                  pathname === item.href ? "text-orange-500" : "text-gray-300"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn && (
              <>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-gray-300 hover:text-orange-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mi Perfil
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-gray-300 hover:text-orange-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Panel Admin
                  </Link>
                )}
              </>
            )}
            <Link
              href="/clanes"
              className="text-sm font-medium text-gray-300 hover:text-orange-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Clanes
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
