"use client"

import type React from "react"

import { useState } from "react"
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
import { Users, Search, Send } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Clan {
  id: string
  name: string
  tag: string
  members?: string[]
  logoUrl?: string
}

interface JoinClanDialogProps {
  clans: Clan[]
  onRequestSent?: () => void
  children?: React.ReactNode
}

export function JoinClanDialog({ clans, onRequestSent, children }: JoinClanDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  const filteredClans = clans.filter(
    (clan) =>
      clan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clan.tag.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleRequestJoin = async (clan: Clan) => {
    setLoading(clan.id)
    setError("")

    try {
      const response = await fetch("/api/clans/join-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clanId: clan.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al enviar solicitud")
      }

      alert(`Solicitud enviada a ${clan.name}`)
      setOpen(false)
      onRequestSent?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar solicitud")
    } finally {
      setLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="border-orange-500 text-orange-500 bg-transparent">
            Unirme a un Clan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a2e] border-orange-500/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Unirme a un Clan</DialogTitle>
          <DialogDescription className="text-gray-400">
            Busca un clan y envía una solicitud para unirte
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Buscar clan por nombre o tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0a0a0f] border-gray-700 text-white"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <ScrollArea className="h-[400px] pr-4">
            {filteredClans.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400">No se encontraron clanes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredClans.map((clan) => (
                  <div
                    key={clan.id}
                    className="flex items-center justify-between p-4 bg-[#0a0a0f] border border-gray-800 rounded-lg hover:border-orange-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center shrink-0 overflow-hidden">
                        {clan.logoUrl ? (
                          <img
                            src={clan.logoUrl || "/placeholder.svg"}
                            alt={clan.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium truncate">{clan.name}</span>
                          <span className="text-orange-500 font-mono text-sm">[{clan.tag}]</span>
                        </div>
                        <p className="text-xs text-gray-500">{clan.members?.length || 0} miembros</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRequestJoin(clan)}
                      disabled={loading === clan.id}
                      className="bg-orange-600 hover:bg-orange-700 text-white shrink-0"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {loading === clan.id ? "Enviando..." : "Solicitar"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
