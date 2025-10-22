"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy } from "lucide-react"
import type { Clan } from "@/lib/clans-storage"

interface ClansListProps {
  currentUserId: string
  userClanId?: string
}

export function ClansList({ currentUserId, userClanId }: ClansListProps) {
  const [clans, setClans] = useState<Clan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClans()
  }, [])

  const fetchClans = async () => {
    try {
      const response = await fetch("/api/clans")
      const data = await response.json()
      setClans(data)
    } catch (error) {
      console.error("Error fetching clans:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-400">Cargando clanes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-orange-500" />
        <h2 className="text-3xl font-bold text-white">Clanes Registrados</h2>
      </div>

      {clans.length === 0 ? (
        <Card className="bg-[#1a1a2e]/50 border-gray-700/50 p-12 text-center backdrop-blur-sm">
          <p className="text-lg text-gray-400">No hay clanes registrados aún</p>
          <p className="mt-2 text-sm text-gray-500">Sé el primero en crear un clan</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clans.map((clan) => (
            <Card
              key={clan.id}
              className="group relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 p-6"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-orange-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

              <div className="relative">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                    {clan.name}
                  </h3>
                  <Badge variant="outline" className="text-orange-500 border-orange-500 text-sm px-2 py-1">
                    {clan.tag}
                  </Badge>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>
                      {clan.memberIds.length} {clan.memberIds.length === 1 ? "miembro" : "miembros"}
                    </span>
                  </div>
                  {clan.id === userClanId && (
                    <Badge className="bg-green-600/20 text-green-400 border-green-500/50">Tu clan</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
