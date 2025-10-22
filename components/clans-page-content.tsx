"use client"

import { useState, useEffect } from "react"
import { Users, Search, ArrowLeft } from "lucide-react"
import { CreateClanDialog } from "@/components/create-clan-dialog"
import { JoinClanDialog } from "@/components/join-clan-dialog"
import { MyClanCard } from "@/components/my-clan-card"
import { ClanInvitationsInbox } from "@/components/clan-invitations-inbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Clan {
  id: string
  name: string
  tag: string
  country: string
  leaderId: string
  members: string[]
  createdAt: string
  logoUrl?: string
}

interface User {
  id: string
  username: string
  isAdmin?: boolean
  avatar?: string
}

interface ClansPageContentProps {
  user: User
  userClan: Clan | null
}

export function ClansPageContent({ user, userClan }: ClansPageContentProps) {
  const [clans, setClans] = useState<Clan[]>([])
  const [filteredClans, setFilteredClans] = useState<Clan[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchClans()
  }, [])

  useEffect(() => {
    let filtered = clans
    if (searchQuery) {
      filtered = filtered.filter(
        (clan) =>
          clan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clan.tag.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }
    setFilteredClans(filtered)
  }, [clans, searchQuery])

  const fetchClans = async () => {
    try {
      const res = await fetch("/api/clans")
      if (res.ok) {
        const data = await res.json()
        setClans(data || [])
      }
    } catch (error) {
      console.error("Error fetching clans:", error)
      setClans([])
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-up">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al Inicio
      </Link>

      <div className="space-y-2">
        <h1 className="font-goldman text-4xl font-bold text-white">Clanes</h1>
        <p className="text-sm text-gray-400">Domina la arena competitiva de Quake Live</p>
      </div>

      {/* Invitations inbox */}
      <ClanInvitationsInbox />

      {userClan ? (
        <MyClanCard clan={userClan} userId={user.id} />
      ) : (
        <div className="bg-[#0f0f0f]/80 backdrop-blur-sm border border-gray-800 p-6 animate-scale-fade">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">No tienes clan?</h2>
              <p className="text-sm text-gray-400">Crea tu propio clan o únete a uno existente</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <CreateClanDialog>
                <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold px-6 py-2">
                  Crear Clan
                </Button>
              </CreateClanDialog>
              <JoinClanDialog clans={filteredClans} onRequestSent={fetchClans}>
                <Button
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-500/10 px-6 py-2 bg-transparent"
                >
                  Unirme a un Clan
                </Button>
              </JoinClanDialog>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Roster de Clanes</h2>
          <p className="text-sm text-gray-400 mt-1">{filteredClans.length} clanes en competencia</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar clan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/60 border-gray-800 text-white"
          />
        </div>
      </div>

      {/* Clans list */}
      <div className="bg-[#0f0f0f]/80 backdrop-blur-sm border border-gray-800 animate-scale-fade">
        {filteredClans.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400">No hay clanes registrados aún</p>
            <p className="text-sm text-gray-600 mt-2">Sé el primero en crear un clan legendario</p>
          </div>
        ) : (
          <div>
            {filteredClans.map((clan) => {
              return (
                <div
                  key={clan.id}
                  className="flex items-center justify-between px-6 py-4 border-b border-gray-800 last:border-b-0 hover:bg-gray-900/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center shrink-0 overflow-hidden">
                      {clan.logoUrl ? (
                        <img
                          src={clan.logoUrl || "/placeholder.svg"}
                          alt={clan.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-orange-500" />
                      )}
                    </div>

                    {/* Clan info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium truncate group-hover:text-purple-400 transition-colors duration-300">
                          {clan.name}
                        </span>
                        <span className="text-orange-500 font-mono text-sm">[{clan.tag}]</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>{clan.members?.length || 0} miembros</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
