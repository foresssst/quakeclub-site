import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const { action } = await request.json()

    // Buscar la invitación
    const invitation = await prisma.clanInvitation.findUnique({
      where: { id },
      include: {
        clan: true,
        player: true,
      },
    })

    if (!invitation) {
      return NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 })
    }

    // Verificar que el usuario sea el destinatario
    if (invitation.player.steamId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar que esté pendiente
    if (invitation.status !== "PENDING") {
      return NextResponse.json({ error: "La invitación ya fue procesada" }, { status: 400 })
    }

    if (action === "accept") {
      // Verificar que el usuario no esté en otro clan
      const existingMembership = await prisma.clanMember.findFirst({
        where: { playerId: invitation.playerId },
      })

      if (existingMembership) {
        return NextResponse.json(
          { error: "Ya perteneces a un clan" },
          { status: 400 }
        )
      }

      // Aceptar: agregar al clan y actualizar invitación
      await prisma.$transaction([
        prisma.clanMember.create({
          data: {
            clanId: invitation.clanId,
            playerId: invitation.playerId,
            role: "MEMBER",
          },
        }),
        prisma.clanInvitation.update({
          where: { id },
          data: {
            status: "ACCEPTED",
            respondedAt: new Date(),
          },
        }),
      ])

      return NextResponse.json({ success: true, message: "Invitación aceptada" })
    } else if (action === "reject") {
      // Rechazar: solo actualizar el estado
      await prisma.clanInvitation.update({
        where: { id },
        data: {
          status: "DECLINED",
          respondedAt: new Date(),
        },
      })

      return NextResponse.json({ success: true, message: "Invitación rechazada" })
    } else {
      return NextResponse.json({ error: "Acción inválida" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing invitation:", error)
    return NextResponse.json({ error: "Error al procesar invitación" }, { status: 500 })
  }
}
