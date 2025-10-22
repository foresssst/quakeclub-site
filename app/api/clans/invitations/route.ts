import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Obtener invitaciones pendientes del usuario
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Buscar jugador en la DB por steamId
    const player = await prisma.player.findUnique({
      where: { steamId: session.user.id },
    })

    if (!player) {
      return NextResponse.json([])
    }

    // Obtener invitaciones pendientes con info del clan
    const invitations = await prisma.clanInvitation.findMany({
      where: {
        playerId: player.id,
        status: "PENDING",
      },
      include: {
        clan: {
          select: {
            id: true,
            name: true,
            tag: true,
            logoUrl: true,
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Obtener información de quien invitó
    const invitationsWithInviter = await Promise.all(
      invitations.map(async (inv) => {
        const inviter = await prisma.player.findUnique({
          where: { steamId: inv.invitedBy },
          select: {
            username: true,
            steamId: true,
          },
        })

        return {
          id: inv.id,
          clanId: inv.clanId,
          clanName: inv.clan.name,
          fromUserId: inv.invitedBy,
          fromUsername: inviter?.username || "Unknown",
          toUserId: session.user.id,
          toUsername: session.user.username,
          status: "pending",
          createdAt: new Date(inv.createdAt).getTime(),
        }
      })
    )

    return NextResponse.json(invitationsWithInviter)
  } catch (error) {
    console.error("Error fetching invitations:", error)
    return NextResponse.json({ error: "Error al obtener invitaciones" }, { status: 500 })
  }
}

// POST - Crear una invitación
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { clanId, toUserId } = await request.json()

    if (!clanId || !toUserId) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar que el clan existe
    const clan = await prisma.clan.findUnique({
      where: { id: clanId },
      include: {
        members: true,
      },
    })

    if (!clan) {
      return NextResponse.json({ error: "Clan no encontrado" }, { status: 404 })
    }

    // Verificar que el usuario que invita es miembro/líder del clan
    const inviter = await prisma.player.findUnique({
      where: { steamId: session.user.id },
    })

    if (!inviter) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const isMember = await prisma.clanMember.findFirst({
      where: {
        clanId: clanId,
        playerId: inviter.id,
        role: { in: ["LEADER", "OFFICER"] },
      },
    })

    if (!isMember) {
      return NextResponse.json({ error: "No tienes permisos para invitar" }, { status: 403 })
    }

    // Buscar el jugador invitado
    const invitee = await prisma.player.findUnique({
      where: { steamId: toUserId },
    })

    if (!invitee) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar que el usuario no esté ya en un clan
    const existingMembership = await prisma.clanMember.findFirst({
      where: { playerId: invitee.id },
    })

    if (existingMembership) {
      return NextResponse.json(
        { error: "El usuario ya pertenece a un clan" },
        { status: 400 }
      )
    }

    // Verificar que no tenga una invitación pendiente
    const existingInvitation = await prisma.clanInvitation.findFirst({
      where: {
        playerId: invitee.id,
        status: "PENDING",
      },
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: "El usuario ya tiene una invitación pendiente" },
        { status: 400 }
      )
    }

    // Crear la invitación
    const invitation = await prisma.clanInvitation.create({
      data: {
        clanId: clanId,
        playerId: invitee.id,
        invitedBy: session.user.id,
        status: "PENDING",
      },
      include: {
        clan: true,
      },
    })

    return NextResponse.json({
      id: invitation.id,
      clanId: invitation.clanId,
      clanName: invitation.clan.name,
      fromUserId: session.user.id,
      fromUsername: session.user.username,
      toUserId: toUserId,
      toUsername: invitee.username,
      status: "pending",
      createdAt: invitation.createdAt.getTime(),
    })
  } catch (error) {
    console.error("Error creating invitation:", error)
    return NextResponse.json({ error: "Error al crear invitación" }, { status: 500 })
  }
}
