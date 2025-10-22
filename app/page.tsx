"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { NewsItem } from "@/lib/news-data"
import { Settings, UserIcon, LogOut, Crown, Trophy, Award } from "lucide-react"
import { NotificationsBell } from "@/components/notifications-bell"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  id: string
  username: string
  isAdmin?: boolean
}

interface RankingPlayer {
  playerId: string
  steamId: string
  username: string
  totalKills: number
  totalDeaths: number
  avgKD: number
  totalMatches: number
  rank: number
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [topPlayers, setTopPlayers] = useState<RankingPlayer[]>([])
  const [loadingRankings, setLoadingRankings] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        if (data.user?.avatar) {
          setAvatarUrl(data.user.avatar)
        }
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    async function fetchNews() {
      const res = await fetch("/api/news/list")
      if (res.ok) {
        const data = await res.json()
        setNews(data.news || [])
      }
    }
    fetchNews()
  }, [])

  useEffect(() => {
    async function fetchRankings() {
      try {
        const res = await fetch("/api/rankings/quakeclub?gameType=all&limit=10")
        if (res.ok) {
          const data = await res.json()
          setTopPlayers(data.players || [])
        }
      } catch (error) {
        console.error("Error fetching rankings:", error)
      } finally {
        setLoadingRankings(false)
      }
    }
    fetchRankings()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.reload()
    } catch (err) {
      alert("Error al cerrar sesión")
    }
  }

  const mainNews = news.length > 0 ? news[0] : null

  const cleanPlayerName = (nick: string) => {
    return nick.replace(/\^[0-9]/g, "")
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-300" />
    if (rank === 3) return <Award className="h-5 w-5 text-orange-400" />
    return null
  }

  return (
    <div className="relative min-h-screen bg-black">
      <div className="fixed inset-0 animate-gradient-flow bg-gradient-to-br from-purple-900/60 via-black to-orange-900/60 bg-[length:200%_200%]" />

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

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="absolute top-8 right-8 z-20">
          {user ? (
            <div className="flex items-center gap-3">
              <NotificationsBell />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white focus:outline-none">
                  {avatarUrl ? (
                    <div className="relative h-8 w-8 overflow-hidden border border-white/30">
                      <Image
                        src={avatarUrl || "/placeholder.svg"}
                        alt="Avatar"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center border border-white/30 bg-gradient-to-br from-purple-600 to-orange-600 text-sm font-bold text-white">
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                  <span>Hola, {user.username}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 border-white/20 bg-black/95 backdrop-blur-sm">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex cursor-pointer items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span>Mi Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/rankings" className="flex cursor-pointer items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                      <span>Rankings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/clanes" className="flex cursor-pointer items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span>Clanes</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex cursor-pointer items-center gap-2 text-orange-400">
                          <Settings className="h-4 w-4" />
                          <span>Panel Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex cursor-pointer items-center gap-2 text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link
              href="/login?returnTo=/"
              className="border border-white/30 bg-black/40 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-black/60 hover:text-white"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>

        <div className="w-full max-w-7xl space-y-16 text-center">
          <div className="animate-blur-fade space-y-8">
            <div className="inline-block">
              <Image src="/logo.png" alt="Quake Club" width={240} height={240} className="h-40 w-auto object-contain" />
            </div>

            <div className="mx-auto max-w-4xl">
              <div className="relative bg-gradient-to-r from-purple-950/40 via-black/80 to-orange-950/40 p-8 backdrop-blur-md">
                <h2 className="mb-6 font-goldman text-2xl font-bold uppercase tracking-wider text-white">
                  Bienvenido a Quake Club
                </h2>

                <p className="text-balance text-base leading-relaxed text-gray-300">
                  Una comunidad competitiva de Quake Live en Chile. Nuestro objetivo principal es convocar a los
                  jugadores a través de torneos regulares en las distintas modalidades y formatos que el juego ofrece.
                  Esta organización busca fomentar la competencia, generando instancias donde destaquen las habilidades
                  individuales como las estrategias de cada clan.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <a
                href="https://www.twitch.tv/quakeclub"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 animate-scale-fade items-center justify-center border-2 border-white bg-transparent transition-all duration-300 hover:scale-110 hover:bg-white/10 [animation-delay:100ms]"
                aria-label="Twitch"
              >
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                </svg>
              </a>

              <a
                href="https://www.youtube.com/@QuakeClubCL"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 animate-scale-fade items-center justify-center border-2 border-white bg-transparent transition-all duration-300 hover:scale-110 hover:bg-white/10 [animation-delay:200ms]"
                aria-label="YouTube"
              >
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93-.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              <a
                href="https://discord.gg/JKDWykm2Jy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 animate-scale-fade items-center justify-center border-2 border-white bg-transparent transition-all duration-300 hover:scale-110 hover:bg-white/10 [animation-delay:300ms]"
                aria-label="Discord"
              >
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.772-1.362 1.226-1.993a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0 a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084-.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
            <Link
              href="/servidores"
              className="group animate-slide-left border-2 border-white bg-transparent px-5 py-3 transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-lg hover:shadow-white/20 [animation-delay:500ms]"
            >
              <h2 className="text-xl font-bold uppercase tracking-wide text-white transition-transform duration-300 group-hover:translate-x-1">
                Server Browser
              </h2>
            </Link>

            <Link
              href="/configs"
              className="group animate-slide-right border-2 border-white bg-transparent px-5 py-3 transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-lg hover:shadow-white/20 [animation-delay:500ms]"
            >
              <h2 className="text-xl font-bold uppercase tracking-wide text-white transition-transform duration-300 group-hover:translate-x-1">
                Configs
              </h2>
            </Link>
          </div>

          <div className="animate-scale-fade pt-8 [animation-delay:700ms]">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Ranking Overall</h2>
                  <Link href="/rankings" className="text-sm text-gray-400 transition-colors hover:text-white">
                    Ver todos →
                  </Link>
                </div>

                <div className="bg-[#0f0f0f] border border-gray-800">
                  {loadingRankings ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    </div>
                  ) : topPlayers.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-sm text-gray-500">No hay rankings disponibles</p>
                    </div>
                  ) : (
                    <>
                      {topPlayers.map((player) => {
                        const rankIcon = getRankIcon(player.rank)

                        return (
                          <Link
                            key={player.playerId}
                            href={`/profile/${player.steamId}`}
                            className="flex items-center justify-between px-6 py-4 border-b border-gray-800 last:border-b-0 hover:bg-gray-900/50 transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-8 flex items-center justify-center shrink-0">
                                {rankIcon || <span className="text-sm text-gray-500">#{player.rank}</span>}
                              </div>

                              <div className="flex-1 min-w-0 text-left">
                                <p className="truncate text-sm font-medium text-white">
                                  {cleanPlayerName(player.username)}
                                </p>
                                <p className="text-xs text-gray-500">{player.totalMatches} partidas</p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-sm font-bold text-white">{player.avgKD}</div>
                              <div className="text-xs text-gray-500">K/D</div>
                            </div>
                          </Link>
                        )
                      })}
                    </>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Noticias</h2>
                  <Link href="/noticias" className="text-sm text-gray-400 transition-colors hover:text-white">
                    Ver todas →
                  </Link>
                </div>

                {mainNews ? (
                  <Link
                    href={`/noticias/${mainNews.id}`}
                    className="group block bg-[#0f0f0f] border border-gray-800 p-6 transition-colors hover:bg-gray-900/50"
                  >
                    <div className="mb-3">
                      <span className="inline-block bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-xs text-purple-400 font-medium">
                        Destacado
                      </span>
                    </div>

                    <h3 className="mb-3 text-xl font-bold leading-tight text-white text-left">{mainNews.title}</h3>

                    <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-400 text-left">
                      {mainNews.excerpt}
                    </p>

                    <span className="text-sm text-gray-500 transition-colors group-hover:text-white">Leer más →</span>
                  </Link>
                ) : (
                  <div className="flex min-h-[300px] items-center justify-center bg-[#0f0f0f] border border-gray-800">
                    <p className="text-sm text-gray-500">Muy pronto más noticias</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="animate-fade-up pt-8 [animation-delay:900ms]">
            <h2 className="mb-8 text-3xl font-bold uppercase tracking-wider text-white">
              Gran final Copa Clan Arena: PRC vs PBS
            </h2>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/50 backdrop-blur-sm shadow-2xl transition-all duration-300 hover:border-white/20 hover:shadow-white/10">
              <div className="relative aspect-video w-full">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/9dhPoXPTW8U"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-20 text-center text-sm text-gray-500">
          <p>&copy; quakeclub.com 2025</p>
        </footer>
      </div>
    </div>
  )
}
