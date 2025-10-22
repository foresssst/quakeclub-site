"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ServerBrowser } from "@/components/server-browser"

export default function ServidoresPage() {
  return (
    <div className="relative min-h-screen bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/50 via-black to-orange-950/50" />

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
              href="/"
              className="flex items-center gap-2 text-gray-400 transition-all duration-300 hover:translate-x-[-4px] hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Inicio</span>
            </Link>
            <Image src="/logo.png" alt="Quake Club" width={60} height={60} className="h-12 w-auto object-contain" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          <div className="mb-8 animate-fade-up text-center [animation-delay:100ms]">
            <h1 className="mb-2 text-3xl font-bold text-white">Server Browser</h1>
          </div>

          <div className="animate-fade-up [animation-delay:200ms]">
            <ServerBrowser />
          </div>
        </div>

        <footer className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
          <p>&copy; quakeclub 2025</p>
        </footer>
      </div>
    </div>
  )
}
