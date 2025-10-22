import Link from "next/link"
import type { NewsItem } from "@/lib/news-data"
import { Calendar, User, ArrowRight } from "lucide-react"

interface NewsCardProps {
  news: NewsItem
  featured?: boolean
}

export function NewsCard({ news, featured = false }: NewsCardProps) {
  const formattedDate = new Date(news.date).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  if (featured) {
    return (
      <Link href={`/noticias/${news.id}`}>
        <article className="group relative overflow-hidden rounded-lg border border-orange-500/30 bg-gradient-to-br from-orange-950/20 via-black/90 to-purple-950/20 backdrop-blur-sm transition-all duration-500 hover:border-orange-500/60 hover:shadow-2xl hover:shadow-orange-500/20">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60" />

          <div className="relative p-8 md:p-12">
            <div className="mb-4 inline-block rounded-full bg-orange-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-400 backdrop-blur-sm">
              Destacado
            </div>

            <h2 className="mb-4 text-3xl font-bold leading-tight text-white transition-colors duration-300 group-hover:text-orange-400 md:text-4xl">
              {news.title}
            </h2>

            <p className="mb-6 text-lg leading-relaxed text-gray-300">{news.excerpt}</p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{news.author}</span>
              </div>
              <div className="ml-auto flex items-center gap-2 font-semibold text-orange-400 transition-transform duration-300 group-hover:translate-x-2">
                <span>Leer artículo completo</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={`/noticias/${news.id}`}>
      <article className="group flex flex-col overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:shadow-xl hover:shadow-white/5 md:flex-row">
        <div className="flex-1 p-6">
          <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>{news.author}</span>
            </div>
          </div>

          <h3 className="mb-3 text-xl font-bold text-white transition-colors duration-300 group-hover:text-orange-400">
            {news.title}
          </h3>

          <p className="mb-4 leading-relaxed text-gray-400">{news.excerpt}</p>

          <div className="flex items-center gap-2 text-sm font-semibold text-orange-400 transition-transform duration-300 group-hover:translate-x-1">
            <span>Continuar leyendo</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </article>
    </Link>
  )
}
