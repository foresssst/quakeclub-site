"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { parseQuakeColors } from "@/lib/quake-colors"

interface AliasesContentProps {
  steamId: string
}

interface AliasRecord {
  alias: string
  firstSeen: string
  lastSeen: string
  timesUsed: number
}

export function AliasesContent({ steamId }: AliasesContentProps) {
  const [aliases, setAliases] = useState<AliasRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAliases() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/aliases/${steamId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch aliases")
        }

        const data = await response.json()
        setAliases(data.aliases || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchAliases()
  }, [steamId])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href={`/profile/${steamId}`}
        className="inline-flex items-center gap-2 border border-white/20 bg-black/40 px-4 py-2 text-white backdrop-blur-sm transition-all hover:bg-black/60"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al Perfil
      </Link>

      <div className="animate-fade-up text-center space-y-3">
        <div className="inline-block border-b-4 border-purple-500 pb-2">
          <h1 className="font-goldman text-4xl font-bold uppercase tracking-wider text-white">Aliases</h1>
        </div>
        <p className="text-gray-400 text-sm">Historial de nombres utilizados</p>
      </div>

      <div className="animate-fade-up border-l-4 border-purple-500 bg-black/80 backdrop-blur-sm [animation-delay:50ms]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : aliases.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="font-goldman">No se encontraron aliases para este jugador</p>
            <p className="mt-2 text-sm text-gray-500">
              Los aliases se registran cuando juegas en servidores de QuakeClub
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {aliases.map((alias, index) => (
              <div key={index} className="flex items-center justify-between p-4 transition-all hover:bg-purple-950/20">
                <div className="flex-1 min-w-0">
                  <p className="font-goldman text-lg font-medium text-white mb-1">{parseQuakeColors(alias.alias)}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>
                      Primera vez:{" "}
                      {new Date(alias.firstSeen).toLocaleDateString("es-CL", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      Última vez:{" "}
                      {new Date(alias.lastSeen).toLocaleDateString("es-CL", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="font-roboto text-2xl font-bold text-purple-400">{alias.timesUsed}</p>
                  <p className="text-xs text-gray-500">veces usado</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {aliases.length > 0 && (
          <div className="border-t border-white/10 bg-black/60 px-4 py-3">
            <p className="text-xs text-gray-500 text-center">Total de aliases registrados: {aliases.length}</p>
          </div>
        )}
      </div>
    </div>
  )
}
