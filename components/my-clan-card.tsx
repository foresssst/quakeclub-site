"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, LogOut } from "lucide-react"
import type { Clan } from "@/lib/clans-storage"
import { InvitePlayerDialog } from "@/components/invite-player-dialog"
import { ManageClanDialog } from "@/components/manage-clan-dialog"

interface MyClanCardProps {
  clan: Clan
  userId: string
}

export function MyClanCard({ clan, userId }: MyClanCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isLeader = clan.leaderId === userId

  const handleLeaveClan = async () => {
    if (!confirm("¿Estás seguro de que quieres salir del clan?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/clans/members/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clanId: clan.id, action: "leave" }),
      })

      if (!response.ok) throw new Error("Error al salir del clan")

      router.refresh()
    } catch (error) {
      console.error("Error leaving clan:", error)
      alert("Error al salir del clan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-orange-500/30 p-6 mb-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{clan.name}</h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-orange-500 border-orange-500 text-lg px-3 py-1">
              {clan.tag}
            </Badge>
            {isLeader && (
              <Badge className="bg-purple-600/20 text-purple-400 border-purple-500">
                <Shield className="w-3 h-3 mr-1" />
                Líder
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {isLeader && (
            <>
              <InvitePlayerDialog clanId={clan.id} clanName={clan.name} />
              <ManageClanDialog clan={clan} />
            </>
          )}
          {!isLeader && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeaveClan}
              disabled={loading}
              className="border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir del Clan
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-400">
        <Users className="w-5 h-5" />
        <span className="text-lg">{clan.memberIds.length} miembros</span>
      </div>
    </Card>
  )
}
