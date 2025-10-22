import { NextResponse } from "next/server"
import { verifyUser, createSession } from "@/lib/auth"
import { cookies } from "next/headers"
import { checkRateLimit, sanitizeUsername, logSecurityEvent, getSecurityHeaders } from "@/lib/security"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const sanitizedUsername = sanitizeUsername(username)

    const rateLimitKey = `login:${sanitizedUsername}`
    if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      logSecurityEvent("RATE_LIMIT_EXCEEDED", { username: sanitizedUsername, endpoint: "login" })
      return NextResponse.json(
        { error: "Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos." },
        { status: 429 },
      )
    }

    const user = await verifyUser(sanitizedUsername, password)
    if (!user) {
      logSecurityEvent("LOGIN_FAILED", { username: sanitizedUsername })
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    const sessionId = createSession(user)
    const cookieStore = await cookies()
    cookieStore.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    logSecurityEvent("LOGIN_SUCCESS", { username: sanitizedUsername, userId: user.id })

    const response = NextResponse.json({ user })
    const headers = getSecurityHeaders()
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    logSecurityEvent("LOGIN_ERROR", { error: String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
