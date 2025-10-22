"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink, Users } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { parseQuakeColors } from "@/lib/quake-colors"

function getMapImageUrl(mapName: string | undefined): string {
  if (!mapName) return "https://ql.syncore.org/images/maps_108_111/default.jpg"
  const cleanMapName = mapName.toLowerCase().trim()
  return `https://ql.syncore.org/images/maps_108_111/${cleanMapName}.jpg`
}

function getFlagUrl(location: string | undefined): string {
  if (!location) return "https://flagsapi.com/CL/flat/32.png"

  const countryMap: Record<string, string> = {
    chile: "CL",
    cl: "CL",
    usa: "US",
    us: "US",
    brazil: "BR",
    br: "BR",
    argentina: "AR",
    ar: "AR",
    mexico: "MX",
    mx: "MX",
  }

  const normalized = location.toLowerCase().trim()
  const countryCode = countryMap[normalized] || "CL"
  return `https://flagsapi.com/${countryCode}/flat/32.png`
}

export function ServerBrowser() {
  const [servers, setServers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

  useEffect(() => {
    async function fetchServers() {
      setLoading(true)
      setError(false)
      try {
        const res = await fetch("/api/servers-status")
        if (res.ok) {
          const data = await res.json()
          const sorted = Array.isArray(data)
            ? [...data].sort((a, b) => (b.players > 0 ? 1 : 0) - (a.players > 0 ? 1 : 0) || b.players - a.players)
            : []
          setServers(sorted)
        } else {
          setError(true)
          setServers([])
        }
      } catch (err) {
        setError(true)
        setServers([])
      }
      setLoading(false)
    }
    fetchServers()
    const interval = setInterval(fetchServers, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleImageError = (idx: number) => {
    setImageErrors((prev) => ({ ...prev, [idx]: true }))
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-12 text-white/60">Cargando servidores...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-400/80">Error al cargar servidores</div>
      ) : servers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay servidores disponibles</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          {servers.map((server, idx) => {
            const serverId = `${server.ip}-${server.port}`.replace(/\./g, "-")

            return (
              <Link
                key={server.ip + ":" + server.port}
                href={`/servidor/${serverId}`}
                style={{ animationDelay: `${idx * 50}ms` }}
                className="group relative animate-fade-up overflow-hidden border border-white/10 bg-black/60 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={
                      imageErrors[idx]
                        ? "https://ql.syncore.org/images/maps_108_111/default.jpg"
                        : getMapImageUrl(server.map)
                    }
                    alt={server.map || "Map"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={() => handleImageError(idx)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                  {server.players > 0 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 border border-green-500/50 bg-green-500/20 px-2 py-1 backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 animate-pulse bg-green-400" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-green-300">
                        Jugadores en linea
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2">
                    <span className="border border-purple-500/50 bg-purple-500/20 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-purple-300 backdrop-blur-sm">
                      {server.map || "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="p-3 space-y-2.5">
                  <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-tight text-white/90 transition-colors group-hover:text-white">
                    {parseQuakeColors(server.name)}
                  </h3>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <img
                        src={getFlagUrl(server.location) || "/placeholder.svg"}
                        alt="Flag"
                        className="h-3 w-5 object-cover"
                      />
                      <span>{server.location || "Chile"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 border border-white/20 bg-white/5 px-2.5 py-1">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-goldman text-sm font-semibold text-white">
                        {server.players ?? 0}/{server.maxplayers ?? 0}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      window.open(`steam://connect/${server.ip}:${server.port}`, "_blank")
                    }}
                    size="sm"
                    className="w-full rounded-none border-2 border-white bg-transparent font-medium text-white transition-all hover:bg-white/10"
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Conectar
                  </Button>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
