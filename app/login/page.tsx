"use client"
import Image from "next/image"
import Link from "next/link"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const [error, setError] = useState("")
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")

  useEffect(() => {
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        auth_failed: "Autenticación con Steam fallida",
        invalid_steam_id: "Steam ID inválido",
        steam_api_failed: "No se pudo obtener información de Steam",
        callback_failed: "Error en el proceso de autenticación",
      }
      setError(errorMessages[errorParam] || "Error desconocido")
    }
  }, [errorParam])

  const handleSteamLogin = () => {
    window.location.href = "/api/auth/steam"
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed inset-0 animate-gradient-flow bg-gradient-to-br from-purple-900/60 via-black to-orange-900/60 bg-[length:200%_200%]" />

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

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-scale-fade">
          <div className="relative overflow-hidden border border-white/20 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
            <Link
              href="/"
              className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center border border-white/20 bg-white/10 text-white/80 transition-all duration-300 hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Link>

            <div className="mb-8 flex justify-center">
              <Image src="/logo.png" alt="Quake Club" width={100} height={100} className="h-24 w-auto object-contain" />
            </div>

            <h1 className="mb-4 text-center text-3xl font-bold text-white">Bienvenido a Quake Club</h1>

            <p className="mb-8 text-center text-sm text-white/60">
              Inicia sesión con Steam para acceder a tus estadísticas y perfil
            </p>

            <div className="space-y-5">
              {error && (
                <div className="animate-fade-up border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                onClick={handleSteamLogin}
                className="group relative w-full overflow-hidden border-2 border-[#66c0f4]/30 bg-gradient-to-r from-[#171a21] via-[#1b2838] to-[#171a21] px-6 py-6 font-semibold text-white transition-all duration-300 hover:border-[#66c0f4]/60 hover:shadow-[0_0_30px_rgba(102,192,244,0.3)]"
              >
                <div className="flex items-center justify-center gap-3">
                  <Image src="/steam-icon.png" alt="Steam" width={32} height={32} className="h-8 w-8" />
                  <span className="text-lg">Iniciar sesión con Steam</span>
                </div>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>

              <div className="text-center text-xs text-white/40">
                Al iniciar sesión, aceptas conectar tu cuenta de Steam con Quake Club
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <Link
                  href="/admin/login"
                  className="block text-center text-xs text-white/30 transition-colors hover:text-white/50"
                >
                  Acceso Administrador →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
