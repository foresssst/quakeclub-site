"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Check, X, Users } from "lucide-react"
import type { ClanInvitation } from "@/lib/clans-storage"

export function ClanInvitationsInbox() {
  const router = useRouter()
  const [invitations, setInvitations] = useState<ClanInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchInvitations()
  }, [])

  const fetchInvitations = async () => {
    try {
      const response = await fetch("/api/clans/invitations")
      const data = await response.json()
      setInvitations(data)
    } catch (error) {
      console.error("Error fetching invitations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvitation = async (invitationId: string, action: "accept" | "reject") => {
    setProcessingId(invitationId)
    try {
      const response = await fetch(`/api/clans/invitations/${invitationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al procesar invitación")
      }

      await fetchInvitations()
      router.refresh()

      if (action === "accept") {
        alert("Te has unido al clan exitosamente")
      }
    } catch (error) {
      console.error("Error processing invitation:", error)
      alert(error instanceof Error ? error.message : "Error al procesar la invitación")
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return null
  }

  if (invitations.length === 0) {
    return null
  }

  return (
    <div className="animate-fade-up border-l-4 border-orange-500 bg-black/80 backdrop-blur-sm p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center bg-gradient-to-br from-orange-600 to-red-600">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white font-goldman">Invitaciones Pendientes</h3>
          <p className="text-sm text-gray-400">
            Tienes {invitations.length} invitación{invitations.length > 1 ? "es" : ""} de clan
          </p>
        </div>
        <Badge className="bg-orange-600 text-white text-lg px-4 py-2">{invitations.length}</Badge>
      </div>

      <div className="space-y-3">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between bg-black/60 p-4 border border-white/10 hover:border-orange-500/30 transition-all"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-orange-600 text-lg font-bold text-white shrink-0">
                {invitation.fromUsername[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium mb-1">
                  <span className="text-purple-400 font-bold">{invitation.fromUsername}</span> te invitó a unirte a{" "}
                  <span className="text-orange-400 font-bold">{invitation.clanName}</span>
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Users className="w-3 h-3" />
                  <span>{formatDate(invitation.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 shrink-0 ml-4">
              <Button
                size="sm"
                onClick={() => handleInvitation(invitation.id, "accept")}
                disabled={processingId === invitation.id}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-4 h-4 mr-1" />
                Aceptar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleInvitation(invitation.id, "reject")}
                disabled={processingId === invitation.id}
                className="border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent"
              >
                <X className="w-4 h-4 mr-1" />
                Rechazar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
