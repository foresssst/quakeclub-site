import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getClanByUserId, getJoinRequestsForClan } from "@/lib/clans-storage"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Get user's clan
    const clan = getClanByUserId(session.user.id)
    if (!clan || clan.leaderId !== session.user.id) {
      // User is not a clan leader
      return NextResponse.json({ requests: [] })
    }

    // Get join requests for the clan
    const requests = getJoinRequestsForClan(clan.id)

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Error fetching join requests:", error)
    return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 })
  }
}
