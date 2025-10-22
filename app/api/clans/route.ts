import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createClan, getAllClans } from "@/lib/clans-storage"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const clans = getAllClans()
    return NextResponse.json(clans)
  } catch (error) {
    console.error("Error fetching clans:", error)
    return NextResponse.json({ error: "Error al obtener clanes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { name, tag, logoUrl } = await request.json()

    if (!name || !tag) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Buscar el jugador en la base de datos
    // IMPORTANTE: Para usuarios Steam, el id es steamId. Para admin-1, necesitamos buscarlo diferente
    let player = null

    if (session.user.steamId) {
      // Usuario con Steam
      player = await prisma.player.findUnique({
        where: { steamId: session.user.steamId },
      })
    } else {
      // Usuario sin Steam (como operador), buscar por username o id
      player = await prisma.player.findFirst({
        where: {
          OR: [
            { username: session.user.username },
            { steamId: session.user.id },
          ]
        },
      })
    }

    // Si el jugador no existe en Prisma, crearlo
    if (!player) {
      player = await prisma.player.create({
        data: {
          steamId: session.user.steamId || session.user.id,
          username: session.user.username,
        },
      })
    }

    // Verificar que el jugador no esté ya en un clan
    const existingMembership = await prisma.clanMember.findFirst({
      where: { playerId: player.id },
    })

    if (existingMembership) {
      return NextResponse.json(
        { error: "Ya perteneces a un clan" },
        { status: 400 }
      )
    }

    // Verificar que no exista un clan con el mismo nombre o tag
    const existingClan = await prisma.clan.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { tag: { equals: tag, mode: 'insensitive' } },
        ],
      },
    })

    if (existingClan) {
      return NextResponse.json(
        { error: "Ya existe un clan con ese nombre o tag" },
        { status: 400 }
      )
    }

    // Crear el clan en PostgreSQL con transacción
    const newClan = await prisma.$transaction(async (tx) => {
      // Crear el clan
      const clan = await tx.clan.create({
        data: {
          name,
          tag,
          logoUrl: logoUrl || null,
        },
      })

      // Agregar al creador como LEADER
      await tx.clanMember.create({
        data: {
          clanId: clan.id,
          playerId: player.id,
          role: "LEADER",
        },
      })

      return clan
    })

    // También crear en el sistema JSON legacy para compatibilidad
    const jsonClan = createClan(name, tag, session.user.id, logoUrl)

    return NextResponse.json({
      id: newClan.id,
      name: newClan.name,
      tag: newClan.tag,
      logoUrl: newClan.logoUrl,
      leaderId: session.user.id,
      memberIds: [session.user.id],
      createdAt: newClan.foundedAt.getTime(),
    })
  } catch (error) {
    console.error("Error creating clan:", error)
    return NextResponse.json({ error: "Error al crear clan" }, { status: 500 })
  }
}
