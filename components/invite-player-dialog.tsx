"use client"

import type React from "react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus } from "lucide-react"

interface User {
  id: string
  username: string
  isAdmin: boolean
}

interface InvitePlayerDialogProps {
  clanId: string
  clanName: string
}

export function InvitePlayerDialog({ clanId, clanName }: InvitePlayerDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      fetchAvailableUsers()
    }
  }, [open])

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch("/api/users")
      const allUsers = await response.json()

      // Filter out users who are already in clans
      const clansResponse = await fetch("/api/clans")
      const clans = await clansResponse.json()

      const usersInClans = new Set()
      clans.forEach((clan: any) => {
        clan.memberIds.forEach((id: string) => usersInClans.add(id))
      })

      const availableUsers = allUsers.filter((user: User) => !usersInClans.has(user.id))
      setUsers(availableUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/clans/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clanId,
          toUserId: selectedUserId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al enviar invitación")
      }

      setOpen(false)
      setSelectedUserId("")
      alert("Invitación enviada exitosamente")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar invitación")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          Invitar Jugador
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a2e] border-orange-500/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Invitar Jugador</DialogTitle>
          <DialogDescription className="text-gray-400">
            Selecciona un jugador registrado para invitarlo a tu clan
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="bg-[#0a0a0f] border-gray-700 text-white">
                <SelectValue placeholder="Selecciona un jugador" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-gray-700 text-white">
                {users.length === 0 ? (
                  <div className="p-2 text-center text-gray-400">No hay jugadores disponibles</div>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !selectedUserId} className="bg-green-600 hover:bg-green-700">
              {loading ? "Enviando..." : "Enviar Invitación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
