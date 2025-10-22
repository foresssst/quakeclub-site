"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Trash2, UserMinus, Shield, ImageIcon } from "lucide-react"
import type { Clan } from "@/lib/clans-storage"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface User {
  id: string
  username: string
  isAdmin: boolean
}

interface ManageClanDialogProps {
  clan: Clan
}

export function ManageClanDialog({ clan }: ManageClanDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; username: string } | null>(null)
  const [logoUrl, setLogoUrl] = useState(clan.logoUrl || "")
  const [updatingAvatar, setUpdatingAvatar] = useState(false)

  useEffect(() => {
    if (open) {
      fetchMembers()
    }
  }, [open])

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/users")
      const allUsers = await response.json()
      const clanMembers = allUsers.filter((user: User) => clan.memberIds.includes(user.id))
      setMembers(clanMembers)
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/clans/members/${memberId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clanId: clan.id, action: "remove" }),
      })

      if (!response.ok) throw new Error("Error al remover miembro")

      await fetchMembers()
      router.refresh()
      setMemberToRemove(null)
    } catch (error) {
      console.error("Error removing member:", error)
      alert("Error al remover miembro")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClan = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/clans/${clan.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar clan")

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error deleting clan:", error)
      alert("Error al eliminar clan")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAvatar = async () => {
    if (!logoUrl.trim()) {
      alert("Por favor ingresa una URL válida")
      return
    }

    setUpdatingAvatar(true)
    try {
      const response = await fetch(`/api/clans/${clan.id}/avatar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: logoUrl.trim() }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al actualizar avatar")
      }

      alert("Avatar actualizado correctamente")
      router.refresh()
    } catch (error) {
      console.error("Error updating avatar:", error)
      alert(error instanceof Error ? error.message : "Error al actualizar avatar")
    } finally {
      setUpdatingAvatar(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
          >
            <Settings className="w-4 h-4 mr-2" />
            Gestionar Clan
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#1a1a2e] border-orange-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Gestionar Clan</DialogTitle>
            <DialogDescription className="text-gray-400">
              Administra los miembros y configuración del clan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-orange-500" />
                Avatar del Clan
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-600/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center shrink-0 overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-8 h-8 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="logoUrl" className="text-sm text-gray-400">
                      URL de la imagen
                    </Label>
                    <Input
                      id="logoUrl"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://ejemplo.com/imagen.png"
                      className="bg-[#0a0a0f] border-gray-700 text-white mt-1"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleUpdateAvatar}
                  disabled={updatingAvatar}
                  className="bg-orange-600 hover:bg-orange-700 text-white w-full"
                >
                  {updatingAvatar ? "Actualizando..." : "Actualizar Avatar"}
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-500" />
                Miembros del Clan ({members.length})
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between bg-[#0a0a0f] p-3 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{member.username}</p>
                        {member.id === clan.leaderId && <p className="text-xs text-purple-400">Líder del clan</p>}
                      </div>
                    </div>

                    {member.id !== clan.leaderId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setMemberToRemove({ id: member.id, username: member.username })}
                        className="border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent"
                      >
                        <UserMinus className="w-4 h-4 mr-1" />
                        Remover
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-3 text-red-500">Zona de Peligro</h3>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Clan
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Esta acción es permanente y eliminará el clan y todas sus invitaciones pendientes.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteClan}
        title="Eliminar Clan"
        description={`¿Estás seguro de que quieres eliminar el clan "${clan.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        confirmVariant="destructive"
      />

      {memberToRemove && (
        <ConfirmDialog
          open={!!memberToRemove}
          onOpenChange={(open) => !open && setMemberToRemove(null)}
          onConfirm={() => handleRemoveMember(memberToRemove.id)}
          title="Remover Miembro"
          description={`¿Estás seguro de que quieres remover a ${memberToRemove.username} del clan?`}
          confirmText="Remover"
          confirmVariant="destructive"
        />
      )}
    </>
  )
}
