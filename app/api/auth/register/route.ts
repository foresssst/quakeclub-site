import { NextResponse } from "next/server"
import { createUser, createSession } from "@/lib/auth"
import { cookies } from "next/headers"
import { checkRateLimit, sanitizeUsername, logSecurityEvent, getSecurityHeaders } from "@/lib/security"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const sanitizedUsername = sanitizeUsername(username)

    if (sanitizedUsername.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const rateLimitKey = `register:${sanitizedUsername}`
    if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
      logSecurityEvent("RATE_LIMIT_EXCEEDED", { username: sanitizedUsername, endpoint: "register" })
      return NextResponse.json(
        { error: "Demasiados intentos de registro. Intenta de nuevo más tarde." },
        { status: 429 },
      )
    }

    const user = await createUser(sanitizedUsername, password)
    if (!user) {
      logSecurityEvent("REGISTER_FAILED", { username: sanitizedUsername, reason: "username_exists" })
      return NextResponse.json({ error: "Username already exists" }, { status: 409 })
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

    logSecurityEvent("REGISTER_SUCCESS", { username: sanitizedUsername, userId: user.id })

    const response = NextResponse.json({ user })
    const headers = getSecurityHeaders()
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    logSecurityEvent("REGISTER_ERROR", { error: String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
