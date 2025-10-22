"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Users, Trash2, Shield, Newspaper } from "lucide-react"
import { ConfirmDialog } from "@/components/confirm-dialog"
import type { Clan } from "@/lib/clans-storage"

interface User {
  id: string
  username: string
  isAdmin?: boolean
}

export default function AdminClansPage() {
  const [user, setUser] = useState<User | null>(null)
  const [clans, setClans] = useState<Clan[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; clanId: string; name: string }>({
    open: false,
    clanId: "",
    name: "",
  })
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        if (!data.user.isAdmin) {
          router.push("/")
          return
        }
        setUser(data.user)
      } else {
        router.push("/login?returnTo=/admin/clans")
      }
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    if (user?.isAdmin) {
      fetchClans()
    }
  }, [user])

  async function fetchClans() {
    try {
      const res = await fetch("/api/clans")
      if (res.ok) {
        const data = await res.json()
        setClans(data || [])
      }
    } catch (error) {
      console.error("Error fetching clans:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    const clan = clans.find((c) => c.id === id)
    setDeleteDialog({ open: true, clanId: id, name: clan?.name || "este clan" })
  }

  async function confirmDelete() {
    const { clanId } = deleteDialog
    setDeleteDialog({ open: false, clanId: "", name: "" })

    try {
      const res = await fetch(`/api/admin/clans/${clanId}`, { method: "DELETE" })
      if (res.ok) {
        setClans(clans.filter((clan) => clan.id !== clanId))
      } else {
        alert("Error al eliminar el clan")
      }
    } catch (error) {
      console.error("Error deleting clan:", error)
      alert("Error al eliminar el clan")
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch (err) {
      alert("Error al cerrar sesión")
    }
  }

  if (!user?.isAdmin) {
    return null
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
              <span className="font-roboto text-sm text-white/70">
                Admin: <span className="font-medium text-white">{user.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="font-roboto border border-white/20 px-3 py-1.5 text-sm text-white/80 transition-all duration-300 hover:border-white/40 hover:bg-white/5 hover:text-white"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-white">Panel de Administración</h1>
            <p className="font-roboto text-gray-400">Gestiona los clanes del sitio</p>
          </div>

          <div className="mb-6 flex gap-2 border-b border-white/10">
            <Link
              href="/admin"
              className="border-b-2 border-transparent px-4 py-2 font-semibold text-gray-400 transition-colors hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                Noticias
              </span>
            </Link>
            <Link
              href="/admin/users"
              className="border-b-2 border-transparent px-4 py-2 font-semibold text-gray-400 transition-colors hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuarios
              </span>
            </Link>
            <Link href="/admin/clans" className="border-b-2 border-orange-500 px-4 py-2 font-semibold text-orange-400">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Clanes
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="font-roboto text-gray-400">Cargando...</div>
            </div>
          ) : clans.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-black/40 py-20 backdrop-blur-sm">
              <p className="font-roboto mb-4 text-lg text-gray-400">No hay clanes registrados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clans.map((clan) => (
                <div
                  key={clan.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-black/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-black/70"
                >
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-xl font-bold text-white">{clan.name}</h3>
                      <span className="rounded border border-orange-500 bg-orange-500/10 px-2 py-0.5 text-sm font-semibold text-orange-400">
                        {clan.tag}
                      </span>
                    </div>
                    <div className="font-roboto flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {clan.memberIds.length} miembros
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        Líder ID: {clan.leaderId}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(clan.id)}
                      className="font-roboto flex items-center gap-2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 transition-all duration-300 hover:border-red-500/50 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
          <p>&copy; quakeclub 2025</p>
        </footer>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Eliminar Clan"
        description={`¿Estás seguro de que quieres eliminar "${deleteDialog.name}"? Esta acción no se puede deshacer y todos los miembros perderán su clan.`}
        onConfirm={confirmDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
}
