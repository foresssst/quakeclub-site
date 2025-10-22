import type React from "react"
import type { Metadata } from "next"

import "./globals.css"

import { Goldman, Roboto } from "next/font/google"

const goldman = Goldman({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-goldman",
})

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
})

export const metadata: Metadata = {
  title: "Quake Club",
  description: "Una comunidad de quake live chilena dedicada a los servidores comunitarios y la competición.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${goldman.variable} ${roboto.variable} font-roboto antialiased`}>
        {children}
      </body>
    </html>
  )
}
