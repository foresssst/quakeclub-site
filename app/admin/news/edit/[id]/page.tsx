"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import type { NewsItem } from "@/lib/news-data"
import { MarkdownEditor } from "@/components/markdown-editor"

interface User {
  id: string
  username: string
  isAdmin?: boolean
}

export default function EditNewsPage() {
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [news, setNews] = useState<NewsItem | null>(null)
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [author, setAuthor] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        if (!data.user.isAdmin) {
          router.push("/")
          return
        }
        setUser(data.user)
      } else {
        router.push("/login?returnTo=/admin")
      }
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    if (user?.isAdmin && params.id) {
      fetchNews()
    }
  }, [user, params.id])

  async function fetchNews() {
    try {
      const res = await fetch(`/api/news/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setNews(data.news)
        setTitle(data.news.title)
        setExcerpt(data.news.excerpt)
        setContent(data.news.content)
        setAuthor(data.news.author)
      } else {
        alert("Noticia no encontrada")
        router.push("/admin")
      }
    } catch (error) {
      console.error("Error fetching news:", error)
      alert("Error al cargar la noticia")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !excerpt || !content || !author) {
      alert("Por favor completa todos los campos")
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/news/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          author,
        }),
      })

      if (res.ok) {
        router.push("/admin")
      } else {
        alert("Error al actualizar la noticia")
      }
    } catch (error) {
      console.error("Error updating news:", error)
      alert("Error al actualizar la noticia")
    } finally {
      setSaving(false)
    }
  }

  if (!user?.isAdmin || loading) {
    return null
  }

  return (
    <div className="relative min-h-screen bg-black">
      <div className="fixed inset-0 animate-gradient-flow bg-gradient-to-br from-purple-950/50 via-black to-orange-950/50 bg-[length:200%_200%]" />

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

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="animate-slide-left border-b border-white/10 bg-black/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-gray-400 transition-all duration-300 hover:translate-x-[-4px] hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Volver</span>
            </Link>

            <Image
              src="/logo.png"
              alt="Quake Club"
              width={60}
              height={60}
              className="absolute left-1/2 top-1/2 h-12 w-auto -translate-x-1/2 -translate-y-1/2 object-contain"
            />

            <div className="w-24" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-white">Editar Noticia</h1>
            <p className="font-roboto text-gray-400">Modifica la noticia con soporte para Markdown</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg border border-white/10 bg-black/60 p-6 backdrop-blur-sm">
              <label className="mb-2 block text-sm font-semibold text-white">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-roboto w-full border border-white/20 bg-black/40 px-4 py-2 text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-black/60"
                placeholder="Título de la noticia"
                required
              />
            </div>

            <div className="rounded-lg border border-white/10 bg-black/60 p-6 backdrop-blur-sm">
              <label className="mb-2 block text-sm font-semibold text-white">Extracto</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="font-roboto w-full border border-white/20 bg-black/40 px-4 py-2 text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-black/60"
                placeholder="Breve descripción de la noticia"
                rows={3}
                required
              />
            </div>

            <div className="rounded-lg border border-white/10 bg-black/60 p-6 backdrop-blur-sm">
              <label className="mb-2 block text-sm font-semibold text-white">Contenido (Markdown)</label>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Escribe el contenido usando Markdown... Puedes pegar imágenes con Ctrl+V"
              />
            </div>

            <div className="rounded-lg border border-white/10 bg-black/60 p-6 backdrop-blur-sm">
              <label className="mb-2 block text-sm font-semibold text-white">Autor</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="font-roboto w-full border border-white/20 bg-black/40 px-4 py-2 text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-black/60"
                placeholder="Nombre del autor"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 border-2 border-orange-500 bg-orange-500/10 px-6 py-3 font-semibold text-orange-400 transition-all duration-300 hover:bg-orange-500/20 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
              <Link
                href="/admin"
                className="font-roboto flex items-center justify-center border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white/80 transition-all duration-300 hover:border-white/40 hover:bg-white/10"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>

        <footer className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
          <p>&copy; quakeclub 2025</p>
        </footer>
      </div>
    </div>
  )
}
