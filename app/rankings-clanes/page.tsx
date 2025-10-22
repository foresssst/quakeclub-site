"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Crown, Trophy, Award } from "lucide-react"
import Image from "next/image"

interface ClanRanking {
  id: string
  rank: number
  name: string
  tag: string
  logoUrl?: string
  memberCount: number
  totalElo: number
  averageElo: number
  totalWins: number
  totalLosses: number
  averageKd: number
}

export default function ClanRankingsPage() {
  const [clans, setClans] = useState<ClanRanking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClanRankings() {
      try {
        const res = await fetch("/api/rankings/clans")
        if (res.ok) {
          const data = await res.json()
          setClans(data.clans || [])
        }
      } catch (error) {
        console.error("Error fetching clan rankings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClanRankings()
  }, [])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-orange-400" />
    return null
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Animated gradient background */}
      <div className="fixed inset-0 animate-gradient-flow bg-gradient-to-br from-purple-900/60 via-black to-orange-900/60 bg-[length:200%_200%]" />

      {/* Floating quad.png */}
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

      {/* Main content with relative positioning */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Link>

          <div className="space-y-2">
            <h1 className="font-goldman text-4xl font-bold text-white">Ranking de Clanes</h1>
            <Link
              href="/rankings"
              className="inline-block text-sm text-gray-400 hover:text-purple-400 transition-colors"
            >
              Ver rankings individuales →
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500" />
            </div>
          ) : clans.length === 0 ? (
            <div className="bg-[#0f0f0f]/80 backdrop-blur-sm border border-gray-800 p-12 text-center animate-scale-fade">
              <p className="text-gray-400">No hay clanes registrados aún</p>
            </div>
          ) : (
            <div className="bg-[#0f0f0f]/80 backdrop-blur-sm border border-gray-800 animate-scale-fade">
              {clans.map((clan) => {
                const rankIcon = getRankIcon(clan.rank)

                return (
                  <div
                    key={clan.id}
                    className="flex items-center justify-between px-6 py-4 border-b border-gray-800 last:border-b-0 hover:bg-gray-900/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Rank */}
                      <div className="w-12 flex items-center justify-center shrink-0">
                        {rankIcon || <span className="text-gray-500 text-sm font-medium">#{clan.rank}</span>}
                      </div>

                      {/* Clan logo */}
                      {clan.logoUrl ? (
                        <div className="relative h-10 w-10 overflow-hidden border border-gray-700 shrink-0">
                          <Image
                            src={clan.logoUrl || "/placeholder.svg"}
                            alt={clan.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center border border-gray-700 bg-gradient-to-br from-purple-600 to-orange-600 shrink-0">
                          <span className="font-goldman text-xs font-bold text-white">{clan.tag}</span>
                        </div>
                      )}

                      {/* Clan info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{clan.name}</div>
                        <div className="text-xs text-gray-500">{clan.memberCount} miembros</div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-8 shrink-0">
                      <div className="text-right">
                        <div className="text-white font-bold">{clan.averageElo}</div>
                        <div className="text-xs text-gray-500">ELO Promedio</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{clan.averageKd}</div>
                        <div className="text-xs text-gray-500">K/D</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
