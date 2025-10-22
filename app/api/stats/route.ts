import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getPlayerStats } from "@/lib/qlstats"

const prisma = new PrismaClient()

// Interface basada en el plugin estadisticas.py
interface WeaponStatsData {
  weapon: string  // LG, RL, RG, SG, PG
  hits: number
  shots: number
  damage: number
  kills: number
}

interface MatchStatsPayload {
  steamId: string
  playerName: string
  map: string
  gameType: string  // ca, duel, tdm, ctf
  kills: number
  deaths: number
  damageDealt: number
  damageTaken: number
  weapons: WeaponStatsData[]
  lifetimes?: {
    min?: number
    max?: number
    avg?: number
  }
  // Timestamp del servidor de Quake
  timestamp?: number
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación básica (API key)
    const apiKey = request.headers.get("x-api-key")
    const expectedApiKey = process.env.MINQLX_API_KEY || "quakeclub-minqlx-secret-2025"

    if (apiKey !== expectedApiKey) {
      console.error("Invalid API key")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: MatchStatsPayload = await request.json()

    // Validar datos requeridos
    if (!body.steamId || !body.playerName || !body.map || !body.gameType) {
      return NextResponse.json(
        { error: "Missing required fields: steamId, playerName, map, gameType" },
        { status: 400 }
      )
    }

    console.log(`Received stats from ${body.playerName} (${body.steamId})`)

    // 1. Crear o encontrar el jugador
    const player = await prisma.player.upsert({
      where: { steamId: body.steamId },
      update: {
        username: body.playerName,
        updatedAt: new Date(),
      },
      create: {
        steamId: body.steamId,
        username: body.playerName,
      },
    })

    // 2. Calcular K/D ratio
    const kdRatio = body.deaths > 0 ? body.kills / body.deaths : body.kills

    // 3. Crear registro de match stats
    const matchStats = await prisma.matchStats.create({
      data: {
        playerId: player.id,
        steamId: body.steamId,
        playerName: body.playerName,
        map: body.map,
        gameType: body.gameType.toLowerCase(),
        kills: body.kills,
        deaths: body.deaths,
        damageDealt: body.damageDealt,
        damageTaken: body.damageTaken,
        kdRatio: kdRatio,
        minLifetime: body.lifetimes?.min,
        maxLifetime: body.lifetimes?.max,
        avgLifetime: body.lifetimes?.avg,
        playedAt: body.timestamp ? new Date(body.timestamp) : new Date(),
      },
    })

    // 4. Crear registros de weapon stats
    const weaponStatsPromises = body.weapons.map((weaponData) => {
      const accuracy = weaponData.shots > 0
        ? (weaponData.hits / weaponData.shots) * 100
        : 0

      // Mapear nombre de arma a enum
      const weaponEnum = weaponData.weapon.toUpperCase() as "LG" | "RL" | "RG" | "SG" | "PG" | "GL" | "MG" | "GT"

      return prisma.weaponStats.create({
        data: {
          playerId: player.id,
          matchId: matchStats.id,
          weapon: weaponEnum,
          hits: weaponData.hits,
          shots: weaponData.shots,
          damage: weaponData.damage,
          kills: weaponData.kills,
          accuracy: accuracy,
        },
      })
    })

    await Promise.all(weaponStatsPromises)

    // 5. Trackear cambio de ELO desde QLStats
    try {
      // Obtener stats actuales del jugador desde QLStats
      const qlstatsData = await getPlayerStats(body.steamId)

      if (qlstatsData && qlstatsData.elos) {
        const gameTypeKey = body.gameType.toLowerCase()
        const elosData = qlstatsData.elos as any
        const currentElo = elosData[gameTypeKey]?.g2_r || elosData[gameTypeKey]?.elo || 0

        if (currentElo > 0) {
          // Buscar el último registro de ELO para este player + game type
          const lastEloRecord = await prisma.eloHistory.findFirst({
            where: {
              playerId: player.id,
              gameType: gameTypeKey,
            },
            orderBy: {
              recordedAt: 'desc',
            },
          })

          const eloBefore = lastEloRecord ? lastEloRecord.eloAfter : currentElo
          const eloAfter = currentElo
          const change = eloAfter - eloBefore

          // Guardar snapshot de ELO
          await prisma.eloHistory.create({
            data: {
              playerId: player.id,
              steamId: body.steamId,
              gameType: gameTypeKey,
              eloBefore: eloBefore,
              eloAfter: eloAfter,
              change: change,
              matchId: matchStats.id,
            },
          })

          console.log(`📊 ELO tracked for ${body.playerName}: ${eloBefore} → ${eloAfter} (${change > 0 ? '+' : ''}${change})`)
        }
      }
    } catch (eloError) {
      // No fallar todo el request si falla el tracking de ELO
      console.error("Error tracking ELO (non-fatal):", eloError)
    }

    console.log(`✅ Stats saved for ${body.playerName}: ${body.kills}/${body.deaths} K/D on ${body.map}`)

    return NextResponse.json({
      success: true,
      message: "Stats saved successfully",
      playerId: player.id,
      matchId: matchStats.id,
    })

  } catch (error) {
    console.error("Error saving stats:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// Endpoint GET para verificar que la API está funcionando
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/stats",
    methods: ["POST"],
    description: "Endpoint para recibir estadísticas desde minqlx plugin",
    requiredHeaders: {
      "x-api-key": "API key para autenticación",
      "Content-Type": "application/json",
    },
    examplePayload: {
      steamId: "76561198123456789",
      playerName: "PlayerName",
      map: "campgrounds",
      gameType: "ca",
      kills: 25,
      deaths: 10,
      damageDealt: 5000,
      damageTaken: 3000,
      weapons: [
        {
          weapon: "LG",
          hits: 120,
          shots: 200,
          damage: 1500,
          kills: 5,
        },
      ],
      lifetimes: {
        min: 15.5,
        max: 120.3,
        avg: 45.7,
      },
    },
  })
}
