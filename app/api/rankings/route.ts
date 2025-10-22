import { NextRequest, NextResponse } from "next/server"
import { cache } from "@/lib/cache"

const QLSTATS_BASE_URL = "https://qlstats.net"

interface QLStatsRankingPlayer {
  player_id: number
  steam_id: string
  nick: string
  stripped_nick: string
  rating: number  // Glicko-2 rating
  rd: number      // Rating deviation
  games: number
  rank: number
  country?: string
}

interface RankingsResponse {
  players: QLStatsRankingPlayer[]
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    let gameType = searchParams.get('gameType') || 'duel'
    const region = searchParams.get('region') || '0'  // 0 = todas las regiones
    const limit = parseInt(searchParams.get('limit') || '50')

    // QLStats usa "duel" como el modo principal/overall, no "overall"
    // Mapear "overall" a "duel" para evitar 404
    if (gameType === 'overall') {
      gameType = 'duel'
    }

    // Cache key único por gameType + region
    const cacheKey = `rankings:${gameType}:${region}:${limit}`
    const cachedData = cache.get<RankingsResponse>(cacheKey)

    if (cachedData) {
      console.log(`Cache HIT for ${cacheKey}`)
      return NextResponse.json(cachedData)
    }

    console.log(`Cache MISS for ${cacheKey}, fetching from QLStats API...`)

    // Fetch rankings from QLStats
    const response = await fetch(
      `${QLSTATS_BASE_URL}/ranks/${gameType}/${region}.json?limit=${limit}`,
      {
        headers: {
          "User-Agent": "QuakeClub/1.0",
          "Accept": "application/json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      console.error(`QLStats API error: ${response.status} for ${gameType}`)
      return NextResponse.json(
        { error: `Failed to fetch rankings for ${gameType}` },
        { status: response.status }
      )
    }

    const data: RankingsResponse = await response.json()

    // Si queremos filtrar solo jugadores de Chile, podemos hacerlo aquí
    // Por ahora retornamos todos los rankings
    const responseData = {
      gameType,
      region,
      limit,
      players: data.players || [],
      timestamp: Date.now(),
    }

    // Cache por 5 minutos (rankings no cambian tan rápido)
    cache.set(cacheKey, responseData, 5 * 60 * 1000)

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching rankings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
