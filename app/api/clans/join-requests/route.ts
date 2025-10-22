import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createJoinRequest, getClanById } from "@/lib/clans-storage"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { clanId } = await request.json()

    if (!clanId) {
      return NextResponse.json({ error: "Falta el ID del clan" }, { status: 400 })
    }

    const clan = getClanById(clanId)
    if (!clan) {
      return NextResponse.json({ error: "Clan no encontrado" }, { status: 404 })
    }

    const joinRequest = createJoinRequest(clanId, clan.name, session.user.id, session.user.username)

    if (!joinRequest) {
      return NextResponse.json(
        { error: "No se pudo crear la solicitud. Puede que ya estés en un clan o ya tengas una solicitud pendiente." },
        { status: 400 },
      )
    }

    return NextResponse.json(joinRequest)
  } catch (error) {
    console.error("Error creating join request:", error)
    return NextResponse.json({ error: "Error al crear solicitud" }, { status: 500 })
  }
}
