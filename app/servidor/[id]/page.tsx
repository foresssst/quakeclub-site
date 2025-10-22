"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ExternalLink, Users, MapPin, Globe, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { parseQuakeColors } from "@/lib/quake-colors"

const quakeIcons: string[] = Array.from({ length: 26 }, (_, i) => `/quake-icons/${i + 1}.png`)

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

export default function ServerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [server, setServer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const getRandomIcon = useMemo(() => {
    const cache: Record<string, string> = {}
    return (playerName: string) => {
      if (!quakeIcons.length) return null
      if (!cache[playerName]) {
        cache[playerName] = quakeIcons[Math.floor(Math.random() * quakeIcons.length)]
      }
      return cache[playerName]
    }
  }, [])

  useEffect(() => {
    async function fetchServerDetails() {
      setLoading(true)
      try {
        // Parse server ID back to IP and port
        const id = params.id as string
        const parts = id.split("-")
        const port = parts.pop()
        const ip = parts.join(".")

        const res = await fetch("/api/servers-status")
        if (res.ok) {
          const data = await res.json()
          const foundServer = data.find((s: any) => s.ip === ip && s.port === Number.parseInt(port || "0"))
          setServer(foundServer || null)
        }
      } catch (err) {
        console.error("Error fetching server details:", err)
        setServer(null)
      }
      setLoading(false)
    }

    if (params.id) {
      fetchServerDetails()
      const interval = setInterval(fetchServerDetails, 30000)
      return () => clearInterval(interval)
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white/60">Cargando detalles del servidor...</div>
      </div>
    )
  }

  if (!server) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="text-white/60">Servidor no encontrado</div>
        <Link href="/servidores">
          <Button variant="outline">Volver a servidores</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Header with back button */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/servidores"
            className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a servidores
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Map image header */}
          <div className="relative mb-8 overflow-hidden rounded-lg border border-white/20">
            <div className="relative aspect-[21/9] w-full">
              <img
                src={imageError ? "https://ql.syncore.org/images/maps_108_111/default.jpg" : getMapImageUrl(server.map)}
                alt={server.map || "Map"}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="mb-2 flex items-center gap-3">
                  <span className="rounded-full border border-purple-500/50 bg-purple-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-300">
                    {server.map || "Unknown"}
                  </span>
                  {server.players > 0 && (
                    <span className="flex items-center gap-1.5 rounded-full border border-green-500/50 bg-green-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-green-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      En línea
                    </span>
                  )}
                </div>
                <h1 className="mb-2 text-4xl font-bold text-white">{parseQuakeColors(server.name)}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={getFlagUrl(server.location) || "/placeholder.svg"}
                      alt="Flag"
                      className="h-4 w-6 rounded object-cover"
                    />
                    <span>Chile</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    <span className="font-goldman text-sm">
                      {server.ip}:{server.port}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* Left column - Players list */}
            <div className="space-y-6">
              <div className="rounded-lg border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                  <Users className="h-5 w-5 text-purple-400" />
                  Jugadores en línea
                  <span className="ml-auto font-goldman text-2xl text-purple-400">
                    {server.players ?? 0}/{server.maxplayers ?? 0}
                  </span>
                </h2>

                {Array.isArray(server.playerList) && server.playerList.length > 0 ? (
                  <div className="space-y-2">
                    {server.playerList.map((p: any, i: number) => {
                      const icon = getRandomIcon(p.name)
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:border-purple-500/40 hover:bg-purple-500/10"
                        >
                          {icon && (
                            <img
                              src={icon || "/placeholder.svg"}
                              alt="Icon"
                              className="h-8 w-8 flex-shrink-0 rounded border border-white/30 object-cover"
                              onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                          )}
                          {p.steamid64 ? (
                            <a
                              href={`https://qlstats.net/player/${p.steamid64}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 truncate text-base font-medium transition-colors hover:underline"
                            >
                              {parseQuakeColors(p.name)}
                            </a>
                          ) : (
                            <span className="flex-1 truncate text-base font-medium">{parseQuakeColors(p.name)}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-lg border border-white/10 bg-black/20">
                    <p className="text-gray-500">No hay jugadores en línea</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right column - Server info and connect */}
            <div className="space-y-6">
              <div className="rounded-lg border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
                <h2 className="mb-4 text-lg font-bold text-white">Información del servidor</h2>
                <div className="space-y-3">
                  <div className="flex items-start justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                    <div>
                      <div className="mb-1 text-xs uppercase tracking-wide text-gray-400">Mapa</div>
                      <div className="font-semibold text-white">{server.map || "Unknown"}</div>
                    </div>
                    <MapPin className="h-5 w-5 text-purple-400" />
                  </div>

                  <div className="flex items-start justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                    <div>
                      <div className="mb-1 text-xs uppercase tracking-wide text-gray-400">Ubicación</div>
                      <div className="flex items-center gap-2">
                        <img
                          src={getFlagUrl(server.location) || "/placeholder.svg"}
                          alt="Flag"
                          className="h-4 w-6 rounded object-cover"
                        />
                        <span className="font-semibold text-white">Chile</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex-1">
                      <div className="mb-1 text-xs uppercase tracking-wide text-gray-400">Dirección</div>
                      <div className="font-goldman text-sm font-semibold text-white">
                        {server.ip}:{server.port}
                      </div>
                    </div>
                    <Globe className="h-5 w-5 text-purple-400" />
                  </div>
                </div>
              </div>

              <Button
                onClick={() => window.open(`steam://connect/${server.ip}:${server.port}`, "_blank")}
                className="w-full rounded-lg border-2 border-purple-500 bg-purple-500/20 py-6 text-base font-bold uppercase tracking-wider text-white transition-all hover:border-purple-400 hover:bg-purple-500/30 hover:shadow-lg hover:shadow-purple-500/30"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Conectar al servidor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
