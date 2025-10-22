import type React from "react"
import { getSession } from "@/lib/auth"
import { Header } from "@/components/header"

export async function AppWrapper({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <>
      <Header isLoggedIn={!!session} isAdmin={session?.user?.isAdmin || false} username={session?.user?.username} />
      {children}
    </>
  )
}
