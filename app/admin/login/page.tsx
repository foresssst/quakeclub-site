"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { X, Lock, User, Shield } from "lucide-react"

function AdminLoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") || "/admin"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("Attempting admin login for username:", username)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      console.log("Login response status:", res.status)
      const data = await res.json()
      console.log("Login response data:", data)

      if (res.ok) {
        const authRes = await fetch("/api/auth/me")
        if (authRes.ok) {
          const authData = await authRes.json()
          console.log("Auth check data:", authData)
          if (authData.user.isAdmin) {
            router.push(returnTo)
          } else {
            setError("No tienes permisos de administrador")
            await fetch("/api/auth/logout", { method: "POST" })
          }
        } else {
          console.error("Auth check failed with status:", authRes.status)
          setError("Error al verificar permisos")
        }
      } else {
        setError(data.error || "Credenciales inválidas")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Error al iniciar sesión: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
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
          <div className="relative overflow-hidden border-2 border-orange-500/40 bg-black/70 p-10 shadow-2xl backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-purple-500 to-orange-500" />

            <Link
              href="/login"
              className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center border border-white/20 bg-white/10 text-white/80 transition-all duration-300 hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Link>

            <div className="mb-8 flex flex-col items-center gap-4">
              <div className="relative">
                <Image src="/logo.png" alt="Quake Club" width={80} height={80} className="h-20 w-auto object-contain" />
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/30 border-2 border-orange-500">
                  <Shield className="h-4 w-4 text-orange-400" />
                </div>
              </div>
              <div className="flex items-center gap-2 border-2 border-orange-500/50 bg-orange-500/20 px-5 py-2">
                <Lock className="h-4 w-4 text-orange-400" />
                <span className="font-goldman text-sm font-bold uppercase tracking-wider text-orange-400">
                  Panel Administrativo
                </span>
              </div>
            </div>

            <h1 className="mb-8 text-center font-goldman text-2xl font-bold text-white">Acceso Restringido</h1>

            {error && (
              <div className="mb-6 animate-fade-up border-l-4 border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Error:</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-semibold text-white/90">
                  Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border-2 border-white/20 bg-black/60 py-3 pl-11 pr-4 text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                    placeholder="Ingresa tu usuario"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-white/90">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-2 border-white/20 bg-black/60 py-3 pl-11 pr-4 text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                    placeholder="Ingresa tu contraseña"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full border-2 border-orange-500 bg-gradient-to-r from-orange-500/20 to-purple-500/20 py-3 font-goldman font-bold text-orange-400 transition-all duration-300 hover:from-orange-500/30 hover:to-purple-500/30 hover:shadow-lg hover:shadow-orange-500/20 disabled:opacity-50"
              >
                {loading ? "Verificando..." : "Acceder al Panel"}
              </button>
            </form>

            <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-white/40">
              <Link href="/login" className="transition-colors hover:text-white/60">
                ← Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen overflow-hidden bg-black">
          <div className="fixed inset-0 animate-gradient-flow bg-gradient-to-br from-purple-900/60 via-black to-orange-900/60 bg-[length:200%_200%]" />
          <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
              <div className="relative overflow-hidden border border-white/20 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
                <div className="text-center text-white">Cargando...</div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  )
}
