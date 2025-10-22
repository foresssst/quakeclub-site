import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ steamId: string }> }) {
  try {
    const { steamId } = await params

    if (!steamId) {
      return NextResponse.json({ error: "Steam ID is required" }, { status: 400 })
    }

    console.log("[v0] Fetching aliases for steamId:", steamId)

    const { fetchPlayerAliases } = await import("@/lib/qlstats-api")
    const qlstatsAliases = await fetchPlayerAliases(steamId)

    console.log("[v0] QLStats aliases fetched:", qlstatsAliases.length)

    // Transform QLStats aliases to match the expected format
    const aliases = qlstatsAliases.map((alias) => ({
      alias: alias.name,
      firstSeen: alias.lastSeen, // QLStats only provides last seen
      lastSeen: alias.lastSeen,
      timesUsed: alias.gamesPlayed,
    }))

    // Also try to get local aliases as fallback
    const { getPlayerAliases } = await import("@/lib/alias-tracker")
    const localAliases = await getPlayerAliases(steamId)

    console.log("[v0] Local aliases fetched:", localAliases.length)

    // Merge both sources, prioritizing QLStats data
    const allAliases = [...aliases]

    // Add local aliases that aren't in QLStats
    for (const localAlias of localAliases) {
      if (!allAliases.some((a) => a.alias === localAlias.name)) {
        allAliases.push({
          alias: localAlias.name,
          firstSeen: localAlias.firstSeen,
          lastSeen: localAlias.lastSeen,
          timesUsed: localAlias.timesUsed,
        })
      }
    }

    console.log("[v0] Total aliases:", allAliases.length)

    return NextResponse.json({
      success: true,
      steamId,
      aliases: allAliases,
      totalAliases: allAliases.length,
      source: qlstatsAliases.length > 0 ? "qlstats" : "local",
    })
  } catch (error) {
    console.error("[v0] Error fetching aliases:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
