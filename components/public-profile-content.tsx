"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ChevronDown, ChevronUp, Users, Shield } from "lucide-react"
import Image from "next/image"
import { parseQuakeColors } from "@/lib/quake-colors"
import Link from "next/link"

interface PublicProfileContentProps {
  steamId: string
}

interface QLStatsData {
  stats: {
    games: number
    wins: number
    losses: number
    kills: number
    deaths: number
    kd: number
    winRate: number
    rankName: string
    favoriteMap: string
    playTime: number
    elo: number
  }
  recentGames: Array<{
    map: string
    gameType: string
    result: string
    timestamp: number
    server: string
    score: string
    eloChange?: number
  }>
}

interface PlayerData {
  steamId: string
  username: string
  avatar?: string
  createdAt?: number
  isRegistered: boolean
}

export function PublicProfileContent({ steamId }: PublicProfileContentProps) {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [qlStats, setQlStats] = useState<QLStatsData | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [selectedGameMode, setSelectedGameMode] = useState<string>("overall")
  const [customStats, setCustomStats] = useState<any>(null)
  const [loadingCustomStats, setLoadingCustomStats] = useState(true)
  const [showAllMatches, setShowAllMatches] = useState(false)
  const [loading, setLoading] = useState(true)
  const [playerClan, setPlayerClan] = useState<any>(null)
  const [loadingClan, setLoadingClan] = useState(true)

  useEffect(() => {
    async function fetchPlayerData() {
      setLoading(true)
      try {
        const dbResponse = await fetch(`/api/player/${steamId}`)
        if (dbResponse.ok) {
          const data = await dbResponse.json()
          setPlayerData({
            steamId,
            username: data.username || `Player_${steamId.slice(-6)}`,
            avatar: data.avatar,
            createdAt: data.createdAt,
            isRegistered: true,
          })
          if (data.id) {
            fetchPlayerClan(data.id)
          }
        } else {
          setPlayerData({
            steamId,
            username: `Player_${steamId.slice(-6)}`,
            isRegistered: false,
          })
          setLoadingClan(false)
        }
      } catch (error) {
        console.error("Error fetching player data:", error)
        setPlayerData({
          steamId,
          username: `Player_${steamId.slice(-6)}`,
          isRegistered: false,
        })
        setLoadingClan(false)
      } finally {
        setLoading(false)
      }
    }

    async function fetchPlayerClan(playerId: string) {
      setLoadingClan(true)
      try {
        const response = await fetch("/api/clans")
        if (response.ok) {
          const clans = await response.json()
          const clan = clans.find((c: any) => c.memberIds.includes(playerId) || c.leaderId === playerId)
          if (clan) {
            setPlayerClan(clan)
          }
        }
      } catch (error) {
        console.error("Error fetching clan:", error)
      } finally {
        setLoadingClan(false)
      }
    }

    fetchPlayerData()
  }, [steamId])

  useEffect(() => {
    async function fetchStats() {
      setLoadingStats(true)
      try {
        const response = await fetch(`/api/qlstats/${steamId}?mode=${selectedGameMode}`)
        if (response.ok) {
          const data = await response.json()
          setQlStats(data)
        }
      } catch (error) {
        console.error("Error fetching QLStats:", error)
      } finally {
        setLoadingStats(false)
      }
    }

    fetchStats()
  }, [steamId, selectedGameMode])

  useEffect(() => {
    async function fetchCustomStats() {
      setLoadingCustomStats(true)
      try {
        const response = await fetch(`/api/stats/${steamId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setCustomStats(data)
            if (data.player?.playerName) {
              setPlayerData((prev) => ({
                ...prev!,
                username: data.player.playerName,
              }))
            }
          }
        }
      } catch (error) {
        console.error("Error fetching custom stats:", error)
      } finally {
        setLoadingCustomStats(false)
      }
    }

    fetchCustomStats()
  }, [steamId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500"></div>
      </div>
    )
  }

  if (!playerData) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-white/20 bg-black/40 px-4 py-2 text-white backdrop-blur-sm transition-all hover:bg-black/60"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Menú
        </Link>
        <div className="border border-red-500/30 bg-red-950/20 p-8 text-center backdrop-blur-sm">
          <p className="text-red-400 font-goldman">No se encontró información del jugador</p>
        </div>
      </div>
    )
  }

  const stats = qlStats
    ? {
        gamesPlayed: qlStats.stats.games || 0,
        wins: qlStats.stats.wins || 0,
        losses: qlStats.stats.losses || 0,
        kdRatio: qlStats.stats.kd?.toFixed(2) || "0.00",
        favoriteMap: qlStats.stats.favoriteMap || "N/A",
        joinDate: playerData.createdAt
          ? new Date(playerData.createdAt).toLocaleDateString("es-ES", { month: "long", year: "numeric" })
          : "Desconocido",
        rank: qlStats.stats.rankName || "Sin Clasificar",
        elo: Math.round(qlStats.stats.elo || 0),
      }
    : {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        kdRatio: "0.00",
        favoriteMap: "N/A",
        joinDate: playerData.createdAt
          ? new Date(playerData.createdAt).toLocaleDateString("es-ES", { month: "long", year: "numeric" })
          : "Desconocido",
        rank: "Sin Clasificar",
        elo: 0,
      }

  const gameModes = [
    { id: "overall", name: "Overall" },
    { id: "ca", name: "CA" },
    { id: "duel", name: "Duel" },
    { id: "ctf", name: "CTF" },
    { id: "ffa", name: "FFA" },
    { id: "tdm", name: "TDM" },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 border border-white/20 bg-black/40 px-4 py-2 text-white backdrop-blur-sm transition-all hover:bg-black/60"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al Menú
      </Link>

      {!playerData.isRegistered && (
        <div className="border border-orange-500/30 bg-orange-950/20 p-4 backdrop-blur-sm">
          <p className="text-orange-400 text-sm text-center">
            Este jugador ha participado en servidores de QuakeClub pero no se ha registrado en la plataforma
          </p>
        </div>
      )}

      <div className="animate-fade-up flex flex-wrap gap-2">
        {gameModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setSelectedGameMode(mode.id)}
            className={`font-goldman px-3 py-1.5 text-xs font-medium transition-all border ${
              selectedGameMode === mode.id
                ? "border-purple-500 bg-purple-600/30 text-white"
                : "border-white/20 bg-black/40 text-gray-400 hover:bg-black/60 hover:text-white"
            }`}
          >
            {mode.name}
          </button>
        ))}
      </div>

      <div className="animate-fade-up border-l-4 border-purple-500 bg-black/80 backdrop-blur-sm [animation-delay:50ms]">
        <div className="flex items-center gap-6 p-6">
          {playerData.avatar ? (
            <div className="relative h-24 w-24 overflow-hidden border-2 border-purple-500/50">
              <Image
                src={playerData.avatar || "/placeholder.svg"}
                alt="Avatar"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center border-2 border-purple-500/50 bg-gradient-to-br from-purple-600 to-orange-600 text-4xl font-bold text-white">
              {playerData.username[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-goldman text-3xl font-bold text-white">{parseQuakeColors(playerData.username)}</h2>
              <Link
                href={`/aliases/${steamId}`}
                className="inline-flex items-center gap-1 border border-white/20 bg-black/40 px-2 py-1 text-xs text-gray-400 transition-all hover:border-purple-500/50 hover:bg-black/60 hover:text-white"
                title="Ver aliases"
              >
                <Users className="h-3 w-3" />
                <span>Aliases</span>
              </Link>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-orange-400 font-medium">Jugador</span>
              {playerData.isRegistered && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">Miembro desde {stats.joinDate}</span>
                </>
              )}
              {!loadingClan && playerClan && (
                <>
                  <span className="text-gray-500">•</span>
                  <Link
                    href="/clans"
                    className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Shield className="h-3 w-3" />
                    <span className="font-medium">{playerClan.tag}</span>
                    <span className="text-gray-500">{playerClan.name}</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="animate-fade-up grid grid-cols-2 md:grid-cols-4 gap-3 [animation-delay:100ms]">
        <div className="bg-black/80 backdrop-blur-sm p-4 border border-white/10">
          <p className="text-xs text-gray-400 mb-1">Partidas ganadas</p>
          <p className="font-roboto text-2xl font-bold text-white">{stats.wins}</p>
        </div>

        <div className="bg-black/80 backdrop-blur-sm p-4 border border-white/10">
          <p className="text-xs text-gray-400 mb-1">K/D Ratio</p>
          <p className="font-roboto text-2xl font-bold text-white">{stats.kdRatio}</p>
        </div>

        <div className="bg-black/80 backdrop-blur-sm p-4 border border-white/10">
          <p className="text-xs text-gray-400 mb-1">ELO</p>
          <p className="font-roboto text-2xl font-bold text-white">{stats.elo}</p>
        </div>

        <div className="bg-black/80 backdrop-blur-sm p-4 border border-white/10">
          <p className="text-xs text-gray-400 mb-1">Mapa mas jugado</p>
          <p className="font-roboto text-lg font-bold text-white capitalize truncate">{stats.favoriteMap}</p>
        </div>
      </div>

      {customStats && customStats.weaponStats && Object.keys(customStats.weaponStats).length > 0 && (
        <div className="animate-fade-up border-l-4 border-orange-500 bg-black/80 p-6 backdrop-blur-sm [animation-delay:150ms]">
          <h2 className="font-goldman text-xl font-bold text-white mb-4">Estadísticas de Armas</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(customStats.weaponStats).map(([weaponKey, stats]: [string, any]) => (
              <div
                key={weaponKey}
                className="border-l-2 border-white/20 bg-black/60 p-4 backdrop-blur-sm transition-all hover:border-purple-500"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="font-goldman text-sm font-bold text-white">{weaponKey}</h3>
                  <span
                    className={`font-goldman text-2xl font-bold ${
                      stats.accuracy >= 40
                        ? "text-green-400"
                        : stats.accuracy >= 30
                          ? "text-yellow-400"
                          : "text-orange-400"
                    }`}
                  >
                    {stats.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-500 text-center">
            {customStats.player?.totalMatches || 0} partidas registradas
          </p>
        </div>
      )}

      <div className="animate-fade-up bg-black/80 backdrop-blur-sm p-6 border border-white/10 [animation-delay:200ms]">
        <h2 className="font-goldman text-xl font-bold text-white mb-4">Actividad Reciente</h2>

        {loadingStats ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500"></div>
          </div>
        ) : qlStats && qlStats.recentGames && qlStats.recentGames.length > 0 ? (
          <>
            <div className="space-y-2">
              {qlStats.recentGames.slice(0, showAllMatches ? undefined : 4).map((game, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-black/60 p-3 border border-white/10 transition-all hover:border-purple-500/50 hover:bg-black/70"
                >
                  <div className="h-12 w-12 overflow-hidden border border-white/20 shrink-0">
                    <Image
                      src={`https://ql.syncore.org/images/maps_108_111/${game.map}.jpg`}
                      alt={game.map}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-goldman text-sm font-medium text-white truncate">{game.server}</p>
                    <p className="text-xs text-gray-400">
                      {game.map} • {game.gameType}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p
                        className={`font-goldman text-sm font-bold ${game.result === "win" ? "text-green-400" : game.result === "loss" ? "text-red-400" : "text-gray-400"}`}
                      >
                        {game.result === "win" ? "W" : game.result === "loss" ? "L" : "D"}
                      </p>
                      {game.eloChange !== undefined && game.eloChange !== 0 && (
                        <span
                          className={`text-xs font-bold px-1.5 py-0.5 border ${game.eloChange > 0 ? "text-green-400 border-green-500/30 bg-green-950/20" : "text-red-400 border-red-500/30 bg-red-950/20"}`}
                        >
                          {game.eloChange > 0 ? "+" : ""}
                          {game.eloChange}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(game.timestamp).toLocaleDateString("es-CL", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {qlStats.recentGames.length > 4 && (
              <button
                onClick={() => setShowAllMatches(!showAllMatches)}
                className="w-full mt-3 flex items-center justify-center gap-2 border border-white/20 bg-black/40 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-black/60 hover:text-white"
              >
                {showAllMatches ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Ver todas las partidas ({qlStats.recentGames.length})
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-white/10 bg-black/40">
            <p className="font-goldman text-sm text-gray-400">
              {selectedGameMode === "overall"
                ? "No hay partidas registradas"
                : `No hay partidas recientes de ${gameModes.find((m) => m.id === selectedGameMode)?.name || selectedGameMode.toUpperCase()}`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
