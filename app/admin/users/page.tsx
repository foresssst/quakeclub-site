"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Trash2, Shield, ShieldOff, Newspaper, Users } from "lucide-react"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface User {
  id: string
  username: string
  isAdmin: boolean
}

interface CurrentUser {
  id: string
  username: string
  isAdmin?: boolean
}

export default function UsersAdminPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string; username: string }>({
    open: false,
    userId: "",
    username: "",
  })
  const [adminDialog, setAdminDialog] = useState<{
    open: boolean
    userId: string
    username: string
    currentIsAdmin: boolean
  }>({
    open: false,
    userId: "",
    username: "",
    currentIsAdmin: false,
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
        setCurrentUser(data.user)
      } else {
        router.push("/login?returnTo=/admin/users")
      }
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchUsers()
    }
  }, [currentUser])

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users/list")
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string, username: string) {
    setDeleteDialog({ open: true, userId: id, username })
  }

  async function confirmDelete() {
    const { userId, username } = deleteDialog
    setDeleteDialog({ open: false, userId: "", username: "" })

    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" })
      if (res.ok) {
        setUsers(users.filter((user) => user.id !== userId))
      } else {
        const data = await res.json()
        alert(data.error || "Error al eliminar el usuario")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Error al eliminar el usuario")
    }
  }

  async function handleToggleAdmin(id: string, username: string, currentIsAdmin: boolean) {
    setAdminDialog({ open: true, userId: id, username, currentIsAdmin })
  }

  async function confirmToggleAdmin() {
    const { userId, currentIsAdmin } = adminDialog
    setAdminDialog({ open: false, userId: "", username: "", currentIsAdmin: false })

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: !currentIsAdmin }),
      })

      if (res.ok) {
        setUsers(users.map((user) => (user.id === userId ? { ...user, isAdmin: !currentIsAdmin } : user)))
      } else {
        const data = await res.json()
        alert(data.error || "Error al actualizar el usuario")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Error al actualizar el usuario")
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

  if (!currentUser?.isAdmin) {
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
              href="/admin"
              className="flex items-center gap-2 text-gray-400 transition-all duration-300 hover:translate-x-[-4px] hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Volver al Panel</span>
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
                Admin: <span className="font-medium text-white">{currentUser.username}</span>
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
            <h1 className="mb-2 text-3xl font-bold text-white">Gestión de Usuarios</h1>
            <p className="font-roboto text-gray-400">Administra los usuarios registrados en el sitio</p>
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
            <Link href="/admin/users" className="border-b-2 border-orange-500 px-4 py-2 font-semibold text-orange-400">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuarios
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="font-roboto text-gray-400">Cargando...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-black/40 py-20 backdrop-blur-sm">
              <p className="font-roboto mb-4 text-lg text-gray-400">No hay usuarios registrados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-black/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-black/70"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-purple-500/50 bg-purple-500/10">
                      <span className="text-lg font-bold text-purple-400">{user.username[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="mb-1 text-lg font-bold text-white">{user.username}</h3>
                      <div className="flex items-center gap-2">
                        {user.isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-400">
                            <Shield className="h-3 w-3" />
                            Administrador
                          </span>
                        ) : (
                          <span className="font-roboto text-xs text-gray-500">Usuario</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.username !== "operador" && (
                      <>
                        <button
                          onClick={() => handleToggleAdmin(user.id, user.username, user.isAdmin)}
                          className={`font-roboto flex items-center gap-2 border px-3 py-2 text-sm transition-all duration-300 ${
                            user.isAdmin
                              ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:border-yellow-500/50 hover:bg-yellow-500/20"
                              : "border-green-500/30 bg-green-500/10 text-green-400 hover:border-green-500/50 hover:bg-green-500/20"
                          }`}
                          title={user.isAdmin ? "Quitar admin" : "Hacer admin"}
                        >
                          {user.isAdmin ? (
                            <>
                              <ShieldOff className="h-4 w-4" />
                              Quitar Admin
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4" />
                              Hacer Admin
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="font-roboto flex items-center gap-2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 transition-all duration-300 hover:border-red-500/50 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </>
                    )}
                    {user.username === "operador" && (
                      <span className="font-roboto text-xs text-gray-500 italic">Admin principal (protegido)</span>
                    )}
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

      {/* Custom confirmation dialogs */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Eliminar Usuario"
        description={`¿Estás seguro de que quieres eliminar al usuario "${deleteDialog.username}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />

      <ConfirmDialog
        open={adminDialog.open}
        onOpenChange={(open) => setAdminDialog({ ...adminDialog, open })}
        title={adminDialog.currentIsAdmin ? "Quitar Privilegios de Admin" : "Hacer Administrador"}
        description={`¿Estás seguro de que quieres ${adminDialog.currentIsAdmin ? "quitar privilegios de admin" : "hacer administrador"} a "${adminDialog.username}"?`}
        onConfirm={confirmToggleAdmin}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </div>
  )
}
