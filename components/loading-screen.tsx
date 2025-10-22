"use client"

import Image from "next/image"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="absolute inset-0 animate-gradient-flow bg-gradient-to-br from-purple-900/60 via-black to-orange-900/60 bg-[length:200%_200%]" />

      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="animate-float opacity-20">
          <Image
            src="/quad.png"
            alt=""
            width={600}
            height={400}
            className="h-auto w-full max-w-3xl object-contain blur-sm"
          />
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-white text-2xl font-medium tracking-wide animate-pulse">Cargando...</p>
      </div>
    </div>
  )
}
