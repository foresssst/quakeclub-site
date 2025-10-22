import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { cache } from "@/lib/cache"

const prisma = new PrismaClient()

interface PlayerRanking {
  playerId: string
  steamId: string
  username: string
  totalKills: number
  totalDeaths: number
  totalDamage: number
  totalMatches: number
  avgKD: number
  avgDamagePerMatch: number
  totalScore: number // Puntuación combinada para ranking
  rank: number
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const gameType = searchParams.get('gameType') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Cache key
    const cacheKey = `rankings:quakeclub:${gameType}:${limit}`
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      console.log(`Cache HIT for ${cacheKey}`)
      return NextResponse.json(cachedData)
    }

    console.log(`Cache MISS for ${cacheKey}, calculating rankings from QuakeClub DB...`)

    // Obtener agregados por jugador
    const whereClause = gameType !== 'all' ? { gameType: gameType } : {}

    // Agrupar stats por jugador
    const playerStats = await prisma.matchStats.groupBy({
      by: ['playerId', 'steamId', 'playerName'],
      where: whereClause,
      _sum: {
        kills: true,
        deaths: true,
        damageDealt: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        kdRatio: true,
      },
    })

    // Calcular puntuación y crear rankings
    const rankings: PlayerRanking[] = playerStats.map((stat) => {
      const totalKills = stat._sum.kills || 0
      const totalDeaths = stat._sum.deaths || 0
      const totalDamage = stat._sum.damageDealt || 0
      const totalMatches = stat._count.id || 0
      const avgKD = stat._avg.kdRatio || 0
      const avgDamagePerMatch = totalMatches > 0 ? totalDamage / totalMatches : 0

      // Fórmula de puntuación:
      // - K/D promedio * 1000 (peso alto)
      // - Kills totales * 2
      // - Damage total / 100
      // - Bonus por cantidad de matches (mínimo 5 para rankear)
      const matchBonus = totalMatches >= 5 ? 1 : 0.5
      const totalScore = (
        avgKD * 1000 +
        totalKills * 2 +
        totalDamage / 100
      ) * matchBonus

      return {
        playerId: stat.playerId,
        steamId: stat.steamId,
        username: stat.playerName,
        totalKills,
        totalDeaths,
        totalDamage,
        totalMatches,
        avgKD: Math.round(avgKD * 100) / 100,
        avgDamagePerMatch: Math.round(avgDamagePerMatch),
        totalScore: Math.round(totalScore),
        rank: 0, // Se asignará después de ordenar
      }
    })

    // Ordenar por score descendente y asignar ranks
    rankings.sort((a, b) => b.totalScore - a.totalScore)
    rankings.forEach((player, index) => {
      player.rank = index + 1
    })

    // Limitar resultados
    const topRankings = rankings.slice(0, limit)

    const responseData = {
      success: true,
      gameType,
      limit,
      totalPlayers: rankings.length,
      players: topRankings,
      timestamp: Date.now(),
    }

    // Cache por 5 minutos
    cache.set(cacheKey, responseData, 5 * 60 * 1000)

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error calculating QuakeClub rankings:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
