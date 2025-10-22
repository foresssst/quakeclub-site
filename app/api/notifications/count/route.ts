import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Obtener cantidad de notificaciones pendientes
export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ count: 0 })
    }

    // Buscar jugador en la DB
    const player = await prisma.player.findUnique({
      where: { steamId: session.user.id },
    })

    if (!player) {
      return NextResponse.json({ count: 0 })
    }

    // Contar invitaciones pendientes
    const count = await prisma.clanInvitation.count({
      where: {
        playerId: player.id,
        status: "PENDING",
      },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error fetching notifications count:", error)
    return NextResponse.json({ count: 0 })
  }
}
