import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getAllClans } from "@/lib/clans-storage"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Endpoint de migración: Migrar clanes de JSON a PostgreSQL
export async function POST() {
  try {
    const session = await getSession()

    // Solo admins pueden migrar
    if (!session?.user.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener todos los clanes del sistema JSON
    const jsonClans = getAllClans()

    const results = {
      migrated: [] as string[],
      skipped: [] as string[],
      errors: [] as { clan: string; error: string }[],
    }

    for (const jsonClan of jsonClans) {
      try {
        // Verificar si el clan ya existe en PostgreSQL por nombre o tag
        const existingClan = await prisma.clan.findFirst({
          where: {
            OR: [
              { name: jsonClan.name },
              { tag: jsonClan.tag },
            ],
          },
        })

        if (existingClan) {
          results.skipped.push(jsonClan.name)
          continue
        }

        // Crear el clan en PostgreSQL
        const newClan = await prisma.clan.create({
          data: {
            name: jsonClan.name,
            tag: jsonClan.tag,
            logoUrl: jsonClan.logoUrl || null,
            foundedAt: new Date(jsonClan.createdAt),
          },
        })

        // Migrar miembros
        for (const memberId of jsonClan.memberIds) {
          try {
            // Buscar o crear el jugador
            let player = await prisma.player.findUnique({
              where: { steamId: memberId },
            })

            if (!player) {
              // Si no existe, crear un jugador temporal
              // El username se actualizará cuando el usuario inicie sesión
              player = await prisma.player.create({
                data: {
                  steamId: memberId,
                  username: `user_${memberId.slice(-8)}`, // Temporal
                },
              })
            }

            // Agregar como miembro del clan
            const isLeader = jsonClan.leaderId === memberId
            await prisma.clanMember.create({
              data: {
                clanId: newClan.id,
                playerId: player.id,
                role: isLeader ? "LEADER" : "MEMBER",
              },
            })
          } catch (memberError) {
            console.error(`Error migrating member ${memberId}:`, memberError)
          }
        }

        results.migrated.push(jsonClan.name)
      } catch (clanError) {
        results.errors.push({
          clan: jsonClan.name,
          error: clanError instanceof Error ? clanError.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      message: "Migración completada",
      results,
    })
  } catch (error) {
    console.error("Error migrating clans:", error)
    return NextResponse.json(
      { error: "Error al migrar clanes" },
      { status: 500 }
    )
  }
}
