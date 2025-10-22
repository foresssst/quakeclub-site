import { type NextRequest, NextResponse } from "next/server"
import { getUserBySteamId } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ steamId: string }> }) {
  try {
    const { steamId } = await params

    if (!steamId) {
      return NextResponse.json({ error: "Steam ID is required" }, { status: 400 })
    }

    // Try to find user in our database
    const user = getUserBySteamId(steamId)

    if (!user) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    return NextResponse.json({
      steamId: user.steamId,
      username: user.username,
      avatar: user.avatar,
      createdAt: user.createdAt,
      isAdmin: user.isAdmin,
    })
  } catch (error) {
    console.error("Error fetching player:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
