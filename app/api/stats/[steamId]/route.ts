import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ steamId: string }> }
) {
  try {
    const { steamId } = await params

    if (!steamId) {
      return NextResponse.json({ error: "Steam ID is required" }, { status: 400 })
    }

    // Buscar el jugador en la base de datos
    const player = await prisma.player.findUnique({
      where: { steamId },
      include: {
        matchStats: {
          orderBy: { playedAt: "desc" },
          take: 20,
        },
        weaponStats: {
          orderBy: { createdAt: "desc" },
          take: 100,
        },
      },
    })

    if (!player) {
      return NextResponse.json({
        success: false,
        message: "Player not found in QuakeClub database",
        weaponStats: null,
        matchStats: null,
      })
    }

    // Agregar weapon stats por arma (promedio)
    const weaponAggregates = await prisma.weaponStats.groupBy({
      by: ["weapon"],
      where: { playerId: player.id },
      _sum: {
        hits: true,
        shots: true,
        damage: true,
        kills: true,
      },
      _avg: {
        accuracy: true,
      },
    })

    const weaponStatsByWeapon = weaponAggregates.reduce((acc, stat) => {
      const totalHits = stat._sum.hits || 0
      const totalShots = stat._sum.shots || 0
      const accuracy = totalShots > 0 ? (totalHits / totalShots) * 100 : 0

      acc[stat.weapon] = {
        weapon: stat.weapon,
        totalHits,
        totalShots,
        totalDamage: stat._sum.damage || 0,
        totalKills: stat._sum.kills || 0,
        accuracy: Math.round(accuracy * 10) / 10,
      }
      return acc
    }, {} as Record<string, any>)

    // Stats generales
    const totalMatches = player.matchStats.length

    const totalStats = player.matchStats.reduce(
      (acc, match) => {
        acc.kills += match.kills
        acc.deaths += match.deaths
        acc.damageDealt += match.damageDealt
        acc.damageTaken += match.damageTaken
        return acc
      },
      { kills: 0, deaths: 0, damageDealt: 0, damageTaken: 0 }
    )

    const avgKD = totalStats.deaths > 0 ? totalStats.kills / totalStats.deaths : totalStats.kills

    return NextResponse.json({
      success: true,
      player: {
        steamId: player.steamId,
        username: player.username,
        totalMatches,
      },
      weaponStats: weaponStatsByWeapon,
      overallStats: {
        totalKills: totalStats.kills,
        totalDeaths: totalStats.deaths,
        totalDamageDealt: totalStats.damageDealt,
        totalDamageTaken: totalStats.damageTaken,
        averageKD: Math.round(avgKD * 100) / 100,
      },
      recentMatches: player.matchStats.slice(0, 10).map((match) => ({
        id: match.id,
        map: match.map,
        gameType: match.gameType,
        kills: match.kills,
        deaths: match.deaths,
        kdRatio: match.kdRatio,
        damageDealt: match.damageDealt,
        damageTaken: match.damageTaken,
        playedAt: match.playedAt,
      })),
    })
  } catch (error) {
    console.error("Error fetching custom stats:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
