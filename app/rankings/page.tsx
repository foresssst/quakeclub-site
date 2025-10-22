"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Crown, Trophy, Award } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface RankingPlayer {
  playerId: string
  steamId: string
  username: string
  totalKills: number
  totalDeaths: number
  totalDamage: number
  totalMatches: number
  avgKD: number
  avgDamagePerMatch: number
  totalScore: number
  rank: number
}

interface RankingsData {
  success: boolean
  gameType: string
  limit: number
  totalPlayers: number
  players: RankingPlayer[]
  timestamp: number
}

export default function RankingsPage() {
  const [gameType, setGameType] = useState("all")
  const [rankings, setRankings] = useState<RankingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRankings()
  }, [gameType])

  const fetchRankings = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/rankings/quakeclub?gameType=${gameType}&limit=50`)

      if (!response.ok) {
        throw new Error("Failed to fetch rankings")
      }

      const data = await response.json()
      setRankings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const cleanPlayerName = (nick: string) => {
    return nick.replace(/\^[0-9]/g, "")
  }

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
      <div className="relative z-10 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Link>

          <div className="space-y-2">
            <h1 className="font-goldman text-4xl font-bold text-white">Ranking Chile</h1>
            <Link
              href="/rankings-clanes"
              className="inline-block text-sm text-gray-400 hover:text-purple-400 transition-colors"
            >
              Ver rankings por clanes →
            </Link>
          </div>

          <div className="border-b border-gray-800">
            <Tabs value={gameType} onValueChange={setGameType} className="w-full">
              <TabsList className="bg-transparent border-none h-auto p-0 space-x-6">
                {["all", "ca", "duel", "tdm", "ctf", "ffa"].map((type) => (
                  <TabsTrigger
                    key={type}
                    value={type}
                    className="bg-transparent border-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none px-0 pb-3 text-gray-400 data-[state=active]:text-white uppercase text-xs font-medium transition-all duration-300"
                  >
                    {type === "all" ? "Todos" : type.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="bg-[#0f0f0f]/80 backdrop-blur-sm border border-gray-800 animate-scale-fade">
            {loading ? (
              <div className="p-4 space-y-2">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full bg-gray-900" />
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-400">Error: {error}</div>
            ) : rankings && rankings.players.length > 0 ? (
              <div>
                {rankings.players.map((player) => {
                  const rankIcon = getRankIcon(player.rank)

                  return (
                    <Link
                      key={player.playerId}
                      href={`/profile/${player.steamId}`}
                      className="flex items-center justify-between px-6 py-4 border-b border-gray-800 last:border-b-0 hover:bg-gray-900/50 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Rank */}
                        <div className="w-12 flex items-center justify-center shrink-0">
                          {rankIcon || <span className="text-gray-500 text-sm font-medium">#{player.rank}</span>}
                        </div>

                        {/* Player name */}
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate group-hover:text-purple-400 transition-colors duration-300">
                            {cleanPlayerName(player.username)}
                          </div>
                          <div className="text-xs text-gray-500">{player.totalMatches} partidas</div>
                        </div>
                      </div>

                      {/* K/D */}
                      <div className="text-right shrink-0">
                        <div className="text-white font-bold text-lg">{player.avgKD}</div>
                        <div className="text-xs text-gray-500">K/D</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">No hay datos disponibles para este modo de juego</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
