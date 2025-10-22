"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Upload, ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Users, Shield } from "lucide-react"
import Image from "next/image"
import { parseQuakeColors } from "@/lib/quake-colors"
import { NotificationsBell } from "@/components/notifications-bell"
import Link from "next/link"

interface User {
  id: string
  steamId?: string
  username: string
  isAdmin?: boolean
  avatar?: string
  createdAt?: number
}

interface ProfileContentProps {
  user: User
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

export function ProfileContent({ user: initialUser }: ProfileContentProps) {
  const [user, setUser] = useState(initialUser)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(initialUser.avatar || "")
  const [qlStats, setQlStats] = useState<QLStatsData | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [selectedGameMode, setSelectedGameMode] = useState<string>("overall")
  const [customStats, setCustomStats] = useState<any>(null)
  const [loadingCustomStats, setLoadingCustomStats] = useState(true)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showAllMatches, setShowAllMatches] = useState(false)
  const [userClan, setUserClan] = useState<any>(null)
  const [loadingClan, setLoadingClan] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      if (!initialUser.steamId) {
        setLoadingStats(false)
        return
      }

      setLoadingStats(true)
      try {
        const response = await fetch(`/api/qlstats/${initialUser.steamId}?mode=${selectedGameMode}`)
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
  }, [initialUser.steamId, selectedGameMode])

  useEffect(() => {
    async function fetchCustomStats() {
      if (!initialUser.steamId) {
        setLoadingCustomStats(false)
        return
      }

      setLoadingCustomStats(true)
      try {
        const response = await fetch(`/api/stats/${initialUser.steamId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setCustomStats(data)
          }
        }
      } catch (error) {
        console.error("Error fetching custom stats:", error)
      } finally {
        setLoadingCustomStats(false)
      }
    }

    fetchCustomStats()
  }, [initialUser.steamId])

  useEffect(() => {
    async function fetchUserClan() {
      setLoadingClan(true)
      try {
        const response = await fetch("/api/clans")
        if (response.ok) {
          const clans = await response.json()
          const clan = clans.find((c: any) => c.memberIds.includes(initialUser.id) || c.leaderId === initialUser.id)
          if (clan) {
            setUserClan(clan)
          }
        }
      } catch (error) {
        console.error("Error fetching clan:", error)
      } finally {
        setLoadingClan(false)
      }
    }

    fetchUserClan()
  }, [initialUser.id])

  useEffect(() => {
    if (initialUser.avatar) {
      setPreviewUrl(initialUser.avatar)
    }
  }, [initialUser.avatar])

  const stats = qlStats
    ? {
        gamesPlayed: qlStats.stats.games || 0,
        wins: qlStats.stats.wins || 0,
        losses: qlStats.stats.losses || 0,
        kdRatio: qlStats.stats.kd?.toFixed(2) || "0.00",
        favoriteMap: qlStats.stats.favoriteMap || "N/A",
        joinDate: initialUser.createdAt
          ? new Date(initialUser.createdAt).toLocaleDateString("es-ES", { month: "long", year: "numeric" })
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
        joinDate: initialUser.createdAt
          ? new Date(initialUser.createdAt).toLocaleDateString("es-ES", { month: "long", year: "numeric" })
          : "Desconocido",
        rank: "Sin Clasificar",
        elo: 0,
      }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpdate = async () => {
    if (!avatarFile) {
      console.error("No avatar file selected")
      return
    }

    console.log("Starting avatar upload...", avatarFile.name, avatarFile.size)
    setIsUploading(true)

    try {
      const reader = new FileReader()

      reader.onerror = (error) => {
        console.error("FileReader error:", error)
        alert("Error al leer el archivo")
        setIsUploading(false)
      }

      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string
          console.log("File read successfully, sending to server...")

          const response = await fetch("/api/profile/avatar", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ avatarData: base64 }),
          })

          console.log("Server response status:", response.status)

          if (!response.ok) {
            const error = await response.json()
            console.error("Server error:", error)
            alert(error.error || "Error al subir avatar")
            setIsUploading(false)
            return
          }

          const data = await response.json()
          console.log("Avatar uploaded successfully:", data)

          setUser({ ...user, avatar: data.avatarUrl })
          setPreviewUrl(data.avatarUrl)
          setAvatarFile(null)
          setIsUploading(false)

          setShowConfirmation(true)
        } catch (fetchError) {
          console.error("Fetch error:", fetchError)
          alert("Error al comunicarse con el servidor")
          setIsUploading(false)
        }
      }

      reader.readAsDataURL(avatarFile)
    } catch (error) {
      console.error("Error updating avatar:", error)
      alert("Error al procesar el avatar")
      setIsUploading(false)
    }
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
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="animate-scale-fade border border-green-500/30 bg-black/90 p-8 shadow-2xl backdrop-blur-xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border-2 border-green-500/50">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="font-goldman text-2xl font-bold text-white">Avatar Actualizado</h3>
              <p className="text-gray-300">Tu avatar se ha guardado correctamente</p>
              <button
                onClick={() => {
                  setShowConfirmation(false)
                  window.location.reload()
                }}
                className="w-full border-2 border-green-500 bg-green-500/20 px-6 py-3 font-goldman font-semibold text-green-400 transition-all hover:bg-green-500/30"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      <Link
        href="/"
        className="inline-flex items-center gap-2 border border-white/20 bg-black/40 px-4 py-2 text-white backdrop-blur-sm transition-all hover:bg-black/60"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al Menú
      </Link>

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
          <div className="relative group">
            {previewUrl ? (
              <div className="relative h-24 w-24 overflow-hidden border-2 border-purple-500/50">
                <Image src={previewUrl || "/placeholder.svg"} alt="Avatar" fill className="object-cover" unoptimized />
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/70 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Upload className="h-6 w-6 text-white" />
                </label>
              </div>
            ) : (
              <div className="relative h-24 w-24">
                <div className="flex h-full w-full items-center justify-center border-2 border-purple-500/50 bg-gradient-to-br from-purple-600 to-orange-600 text-4xl font-bold text-white">
                  {user.username[0].toUpperCase()}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/70 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Upload className="h-6 w-6 text-white" />
                </label>
              </div>
            )}
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-goldman text-3xl font-bold text-white">{parseQuakeColors(user.username)}</h2>
              {user.steamId && (
                <Link
                  href={`/aliases/${user.steamId}`}
                  className="inline-flex items-center gap-1 border border-white/20 bg-black/40 px-2 py-1 text-xs text-gray-400 transition-all hover:border-purple-500/50 hover:bg-black/60 hover:text-white"
                  title="Ver aliases"
                >
                  <Users className="h-3 w-3" />
                  <span>Aliases</span>
                </Link>
              )}
              <NotificationsBell />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-orange-400 font-medium">{user.isAdmin ? "Administrador" : "Jugador"}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">Miembro desde {stats.joinDate}</span>
              {!loadingClan && userClan && (
                <>
                  <span className="text-gray-500">•</span>
                  <Link
                    href="/clans"
                    className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Shield className="h-3 w-3" />
                    <span className="font-medium">{userClan.tag}</span>
                    <span className="text-gray-500">{userClan.name}</span>
                  </Link>
                </>
              )}
            </div>
          </div>
          {avatarFile && (
            <button
              onClick={handleAvatarUpdate}
              disabled={isUploading}
              className="shrink-0 border border-purple-500 bg-purple-600/20 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-purple-600/30 disabled:opacity-50"
            >
              {isUploading ? "Guardando..." : "Guardar"}
            </button>
          )}
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
                ? "No tienes partidas registradas aún"
                : `No hay partidas recientes de ${gameModes.find((m) => m.id === selectedGameMode)?.name || selectedGameMode.toUpperCase()}`}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              {selectedGameMode === "overall"
                ? "Juega en servidores con QLStats para empezar a trackear tus stats"
                : "Tus últimas 20 partidas no incluyen este modo de juego"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
