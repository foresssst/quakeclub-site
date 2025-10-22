import { NextResponse } from "next/server"
import { getSession, getAllUsers } from "@/lib/auth"
import { logSecurityEvent, getSecurityHeaders } from "@/lib/security"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user.isAdmin) {
      logSecurityEvent("UNAUTHORIZED_USERS_LIST", { userId: session?.user.id })
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const users = getAllUsers()

    const response = NextResponse.json({ users })
    const headers = getSecurityHeaders()
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    logSecurityEvent("USERS_LIST_ERROR", { error: String(error) })
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
