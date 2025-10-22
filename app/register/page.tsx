"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") || "/configs"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al registrarse")
        setLoading(false)
        return
      }

      router.push(returnTo)
      router.refresh()
    } catch (err) {
      setError("Error de conexión")
      setLoading(false)
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
            <div className="flex items-center gap-6">
              <Image src="/logo.png" alt="Quake Club" width={60} height={60} className="h-12 w-auto object-contain" />
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md animate-scale-fade space-y-8 [animation-delay:200ms]">
            <div className="text-center">
              <h1 className="mb-2 text-3xl font-bold text-white">Crear Cuenta</h1>
              <p className="text-gray-400">Únete a la comunidad de Quake Club</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4 rounded-lg border-2 border-white/20 bg-black/40 p-6 backdrop-blur-sm">
                <div>
                  <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-300">
                    Usuario
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    className="w-full rounded-lg border-2 border-white/20 bg-black/40 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm transition-colors focus:border-purple-500/50 focus:outline-none"
                    placeholder="Mínimo 3 caracteres"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-lg border-2 border-white/20 bg-black/40 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm transition-colors focus:border-purple-500/50 focus:outline-none"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-300">
                    Confirmar Contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border-2 border-white/20 bg-black/40 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm transition-colors focus:border-purple-500/50 focus:outline-none"
                    placeholder="Repite tu contraseña"
                  />
                </div>

                {error && (
                  <div className="rounded-lg border-2 border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full border-2 border-purple-500 bg-purple-500/20 px-6 py-3 font-bold text-white transition-all hover:bg-purple-500/30 disabled:opacity-50"
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-400">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-semibold text-orange-400 transition-colors hover:text-orange-300">
                Inicia sesión aquí
              </Link>
            </div>
          </div>
        </div>

        <footer className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
          <p>&copy; quakeclub 2025</p>
        </footer>
      </div>
    </div>
  )
}
