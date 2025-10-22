"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink, MapPin, Users, ArrowLeft, User, BarChart3 } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

interface ServerDetailModalProps {
  server: any
  onClose: () => void
}

function getMapPreviewUrl(mapName: string): string {
  if (!mapName) return "https://ql.syncore.org/images/maps_108_111/default.jpg"
  return `https://ql.syncore.org/images/maps_108_111/${mapName.toLowerCase()}.jpg`
}

const quakeIcons: string[] = Array.from({ length: 26 }, (_, i) => `/quake-icons/${i + 1}.png`)

function getRandomQuakeIcon(playerName: string): string {
  // Simple hash-based icon selection for consistency
  const hash = playerName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return quakeIcons[hash % quakeIcons.length]
}

export function ServerDetailModal({ server, onClose }: ServerDetailModalProps) {
  const [serverDetails, setServerDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mapPreviewError, setMapPreviewError] = useState(false)

  useEffect(() => {
    async function fetchServerDetails() {
      try {
        const res = await fetch(`/api/server-details?ip=${server.ip}&port=${server.port}`)
        if (res.ok) {
          const data = await res.json()
          setServerDetails(data)
        }
      } catch (err) {
        console.error("Error fetching server details:", err)
      }
      setLoading(false)
    }
    fetchServerDetails()
  }, [server])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto pt-8">
      <div className="w-full max-w-4xl rounded-lg border-2 border-white/20 bg-black/95 backdrop-blur-sm animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 border-b border-white/20 bg-black/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver a Servidores</span>
          </button>
          <h2 className="text-xl font-bold text-white">{server.name}</h2>
          <div className="w-20" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Cargando detalles del servidor...</div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Map Preview */}
              <div className="lg:col-span-2">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-white/20 bg-black/40">
                  {!mapPreviewError ? (
                    <Image
                      src={getMapPreviewUrl(server.map) || "/placeholder.svg"}
                      alt={server.map || "Map preview"}
                      fill
                      className="object-cover"
                      onError={() => setMapPreviewError(true)}
                    />
                  ) : (
                    <Image
                      src="https://ql.syncore.org/images/maps_108_111/default.jpg"
                      alt="Default map preview"
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded-md border border-white/20">
                    <span className="text-white font-semibold text-sm">{server.map}</span>
                  </div>
                </div>
              </div>

              {/* Right: Server Info */}
              <div className="space-y-4">
                <div className="rounded-lg border-2 border-white/20 bg-white/5 p-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Información del Servidor</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="text-gray-400">Dirección</div>
                      <div className="text-white font-goldman text-xs break-all">
                        {server.ip}:{server.port}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Ubicación</div>
                      <div className="flex items-center gap-2 text-white">
                        <MapPin className="h-4 w-4" />
                        Chile
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Tipo de Juego</div>
                      <div className="text-white">{serverDetails?.gameType || "Quake Live"}</div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => window.open(`steam://connect/${server.ip}:${server.port}`, "_blank")}
                  className="w-full px-4 py-2 border-2 border-white bg-transparent font-semibold text-white hover:bg-white/10"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Conectar
                </Button>
              </div>
            </div>

            {/* Server Status */}
            <div className="rounded-lg border-2 border-white/20 bg-white/5 p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Estado del Servidor
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{server.players}</div>
                  <div className="text-xs text-gray-400">Jugadores Activos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{server.maxplayers}</div>
                  <div className="text-xs text-gray-400">Slots máximos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{serverDetails?.observers || 0}</div>
                  <div className="text-xs text-gray-400">Specs</div>
                </div>
              </div>
            </div>

            {/* Players List */}
            {server.playerList && server.playerList.length > 0 && (
              <div className="rounded-lg border-2 border-white/20 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Jugadores en Línea
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {server.playerList.map((player: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-2 rounded-md bg-black/40 border border-white/20 hover:border-white/40 transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 flex-shrink-0 border border-white/20 overflow-hidden">
                        <img
                          src={getRandomQuakeIcon(player.name) || "/placeholder.svg"}
                          alt="Player icon"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      {player.steamid64 ? (
                        <a
                          href={`https://qlstats.net/player/${player.steamid64}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white hover:text-gray-300 hover:underline transition-colors truncate"
                        >
                          {player.name}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-200 truncate">{player.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            {serverDetails?.rules && (
              <div className="rounded-lg border-2 border-white/20 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Reglas del Servidor
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(serverDetails.rules).map(([key, value]: [string, any]) => (
                    <div key={key} className="text-sm">
                      <div className="text-gray-400 capitalize">{key}</div>
                      <div className="text-white font-semibold">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
