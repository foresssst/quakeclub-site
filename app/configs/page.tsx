"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ConfigManager } from "@/components/config-manager"
import { NotificationsBell } from "@/components/notifications-bell"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  username: string
  avatar: string
}

export default function ConfigsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        // Avatar now comes from database
        if (data.user?.avatar) {
          setAvatarUrl(data.user.avatar)
        }
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.reload()
    } catch (err) {
      alert("Error al cerrar sesión")
    }
  }

  return (
    <div className="relative min-h-screen bg-black">
      <div className="fixed inset-0 animate-gradient-flow bg-gradient-to-br from-purple-950/50 via-black to-orange-950/50 bg-[length:200%_200%]" />

      <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
        <div className="animate-float opacity-40">
          <Image
            src="/quad.png"
            alt=""
            width={800}
            height={450}
            className="h-auto w-full max-w-4xl object-contain blur-sm"
            priority
          />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="animate-slide-left border-b border-white/10 bg-black/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 transition-all duration-300 hover:translate-x-[-4px] hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Inicio</span>
            </Link>

            <Image
              src="/logo.png"
              alt="Quake Club"
              width={60}
              height={60}
              className="absolute left-1/2 top-1/2 h-12 w-auto -translate-x-1/2 -translate-y-1/2 object-contain"
            />

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2">
                    {avatarUrl ? (
                      <div className="relative h-8 w-8 overflow-hidden border border-white/30">
                        <Image
                          src={avatarUrl || "/placeholder.svg"}
                          alt="Avatar"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center border border-white/30 bg-gradient-to-br from-purple-600 to-orange-600 text-sm font-bold text-white">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-white/70">
                      Hola, <span className="font-medium text-white">{user.username}</span>
                    </span>
                  </div>
                  <NotificationsBell />
                  <button
                    onClick={handleLogout}
                    className="border border-white/20 px-3 py-1.5 text-sm text-white/80 transition-all duration-300 hover:border-white/40 hover:bg-white/5 hover:text-white"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <Link
                  href="/login?returnTo=/configs"
                  className="border border-white/20 px-3 py-1.5 text-sm text-white/80 transition-all duration-300 hover:border-white/40 hover:bg-white/5 hover:text-white"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          <div className="mb-8 animate-fade-up text-center [animation-delay:100ms]">
            <h1 className="mb-2 text-3xl font-bold text-white">Configuraciones</h1>
            <p className="text-gray-400">Comparte y descarga configs de la comunidad</p>
          </div>

          <div className="animate-scale-fade [animation-delay:200ms]">
            <ConfigManager />
          </div>
        </div>

        <footer className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
          <p>&copy; quakeclub 2025</p>
        </footer>
      </div>
    </div>
  )
}
