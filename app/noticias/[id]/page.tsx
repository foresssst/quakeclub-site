"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import type { NewsItem } from "@/lib/news-data"

export default function NoticiaPage() {
  const params = useParams()
  const router = useRouter()
  const [news, setNews] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch(`/api/news/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setNews(data.news)
        } else {
          router.push("/noticias")
        }
      } catch (error) {
        console.error("Error fetching news:", error)
        router.push("/noticias")
      } finally {
        setLoading(false)
      }
    }
    if (params.id) {
      fetchNews()
    }
  }, [params.id, router])

  if (loading) {
    return (
      <div className="relative min-h-screen bg-black">
        <div className="fixed inset-0 bg-gradient-to-br from-purple-950/50 via-black to-orange-950/50" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="text-gray-400">Cargando...</div>
        </div>
      </div>
    )
  }

  if (!news) {
    return null
  }

  const formattedDate = new Date(news.date).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="relative min-h-screen bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/50 via-black to-orange-950/50" />

      <div className="relative z-10 min-h-screen px-4 py-12">
        <article className="mx-auto w-full max-w-4xl space-y-8">
          <div className="animate-blur-fade space-y-6">
            <Link
              href="/noticias"
              className="inline-flex items-center gap-2 text-gray-400 transition-colors duration-300 hover:text-white"
            >
              <span>←</span>
              <span>Volver a noticias</span>
            </Link>

            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-bold uppercase tracking-wide text-white md:text-5xl">
                {news.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <time dateTime={news.date}>{formattedDate}</time>
                <span>•</span>
                <span>Por {news.author}</span>
              </div>
            </div>
          </div>

          <div className="animate-fade-up border-2 border-white/20 bg-black/60 p-8 backdrop-blur-sm [animation-delay:200ms] md:p-12">
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                disallowedElements={["script", "iframe", "object", "embed"]}
                unwrapDisallowed={true}
                components={{
                  h1: ({ children }) => (
                    <h1 className="mb-6 mt-8 text-3xl font-bold uppercase tracking-wide text-white">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mb-4 mt-8 text-2xl font-bold uppercase tracking-wide text-white">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-3 mt-6 text-xl font-bold uppercase tracking-wide text-white">{children}</h3>
                  ),
                  p: ({ children }) => <p className="mb-4 leading-relaxed text-gray-300">{children}</p>,
                  strong: ({ children }) => <strong className="font-bold text-orange-400">{children}</strong>,
                  em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
                  ul: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-300">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-2 text-gray-300">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-orange-400 underline transition-colors hover:text-orange-300"
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="my-4 border-l-4 border-orange-500 bg-orange-500/10 py-2 pl-4 italic text-gray-300">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-orange-300">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="my-4 overflow-x-auto rounded-lg bg-black/60 p-4 font-mono text-sm text-gray-300">
                      {children}
                    </pre>
                  ),
                }}
              >
                {news.content}
              </ReactMarkdown>
            </div>
          </div>

          <div className="animate-scale-fade text-center [animation-delay:400ms]">
            <Link
              href="/noticias"
              className="inline-block border-2 border-white bg-transparent px-8 py-3 font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-lg hover:shadow-white/20"
            >
              Ver todas las noticias
            </Link>
          </div>
        </article>

        <footer className="mt-20 text-center text-sm text-gray-500">
          <p>&copy; quakeclub 2025</p>
        </footer>
      </div>
    </div>
  )
}
