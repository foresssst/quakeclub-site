import { NextResponse } from "next/server"
import { getAllClans } from "@/lib/clans-storage"
import fs from "fs"
import path from "path"

interface PlayerStats {
  steamId: string
  username: string
  elo: number
  wins: number
  losses: number
  kd: number
}

export async function GET() {
  try {
    const clans = getAllClans()

    // Load player stats from stats.json
    const statsPath = path.join(process.cwd(), "data", "stats.json")
    let playerStats: PlayerStats[] = []

    if (fs.existsSync(statsPath)) {
      const statsData = fs.readFileSync(statsPath, "utf-8")
      playerStats = JSON.parse(statsData)
    }

    // Calculate clan rankings based on total ELO of members
    const clanRankings = clans.map((clan) => {
      // Get stats for all clan members
      const memberStats = clan.memberIds
        .map((memberId) => {
          // Find player stats by user ID (need to map user ID to steam ID)
          // For now, we'll use a simplified approach
          const stats = playerStats.find((p) => p.steamId === memberId)
          return stats
        })
        .filter((stats) => stats !== undefined)

      // Calculate total ELO
      const totalElo = memberStats.reduce((sum, stats) => sum + (stats?.elo || 0), 0)
      const averageElo = memberStats.length > 0 ? totalElo / memberStats.length : 0

      // Calculate total wins and losses
      const totalWins = memberStats.reduce((sum, stats) => sum + (stats?.wins || 0), 0)
      const totalLosses = memberStats.reduce((sum, stats) => sum + (stats?.losses || 0), 0)

      // Calculate average K/D
      const averageKd =
        memberStats.length > 0 ? memberStats.reduce((sum, stats) => sum + (stats?.kd || 0), 0) / memberStats.length : 0

      return {
        id: clan.id,
        name: clan.name,
        tag: clan.tag,
        logoUrl: clan.logoUrl,
        memberCount: clan.memberIds.length,
        totalElo,
        averageElo: Math.round(averageElo),
        totalWins,
        totalLosses,
        averageKd: Number(averageKd.toFixed(2)),
        members: memberStats,
      }
    })

    // Sort by total ELO (descending)
    clanRankings.sort((a, b) => b.totalElo - a.totalElo)

    // Add rank
    const rankedClans = clanRankings.map((clan, index) => ({
      ...clan,
      rank: index + 1,
    }))

    return NextResponse.json({
      success: true,
      clans: rankedClans,
      total: rankedClans.length,
    })
  } catch (error) {
    console.error("Error fetching clan rankings:", error)
    return NextResponse.json({ error: "Error al obtener rankings de clanes" }, { status: 500 })
  }
}
