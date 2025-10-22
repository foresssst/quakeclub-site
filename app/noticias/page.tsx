"use client"

import Link from "next/link"
import { ArrowLeft, Newspaper, Calendar, User, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import type { NewsItem } from "@/lib/news-data"

export default function NoticiasPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch("/api/news/list")
        if (res.ok) {
          const data = await res.json()
          setNews(data.news || [])
        }
      } catch (error) {
        console.error("Error fetching news:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [])

  return (
    <div className="relative min-h-screen bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/50 via-black to-orange-950/50" />

      <div className="relative z-10 min-h-screen px-4 py-12">
        <div className="mx-auto w-full max-w-5xl space-y-12">
          <div className="animate-blur-fade space-y-6 border-b border-white/10 pb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors duration-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver al inicio</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-orange-500/20 p-3">
                <Newspaper className="h-8 w-8 text-orange-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold uppercase tracking-wider text-white md:text-5xl">Noticias</h1>
                <p className="mt-2 text-lg text-gray-400">Últimas novedades y actualizaciones de QuakeClub</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-gray-400">Cargando noticias...</div>
            </div>
          ) : news.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-black/40 py-20 backdrop-blur-sm">
              <Newspaper className="mb-4 h-16 w-16 text-gray-600" />
              <p className="text-lg text-gray-400">No hay noticias publicadas aún</p>
              <p className="mt-2 text-sm text-gray-500">Vuelve pronto para ver las últimas novedades</p>
            </div>
          ) : (
            <div className="animate-fade-up space-y-6 [animation-delay:200ms]">
              {news.map((newsItem, index) => {
                const formattedDate = new Date(newsItem.date).toLocaleDateString("es-CL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })

                return (
                  <Link
                    key={newsItem.id}
                    href={`/noticias/${newsItem.id}`}
                    className="group block animate-scale-fade border-l-4 border-orange-500/30 bg-black/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-orange-500 hover:bg-black/80 hover:shadow-xl hover:shadow-orange-500/10"
                    style={{ animationDelay: `${300 + index * 100}ms` }}
                  >
                    <div className="space-y-3">
                      {index === 0 && (
                        <div className="mb-2 inline-block rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-400">
                          Destacado
                        </div>
                      )}

                      <h2 className="text-2xl font-bold text-white transition-colors duration-300 group-hover:text-orange-400">
                        {newsItem.title}
                      </h2>

                      <p className="leading-relaxed text-gray-300">{newsItem.excerpt}</p>

                      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{newsItem.author}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-2 font-semibold text-orange-400 transition-transform duration-300 group-hover:translate-x-2">
                          <span>Leer artículo completo</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <footer className="mt-20 text-center text-sm text-gray-500">
          <p>&copy; quakeclub 2025</p>
        </footer>
      </div>
    </div>
  )
}
