// Alias tracking utilities
// Tracks player nicknames over time

interface AliasRecord {
  alias: string
  firstSeen: Date
  lastSeen: Date
  timesUsed: number
}

/**
 * Get all aliases for a player by their Steam ID
 * This reads from the MatchStats table to find all unique nicknames
 */
export async function getPlayerAliases(steamId: string): Promise<AliasRecord[]> {
  try {
    // Read from data/stats.json to get all match stats
    const fs = await import("fs/promises")
    const path = await import("path")

    const statsPath = path.join(process.cwd(), "data", "stats.json")

    let statsData: any = { stats: [] }
    try {
      const fileContent = await fs.readFile(statsPath, "utf-8")
      statsData = JSON.parse(fileContent)
    } catch (error) {
      // File doesn't exist yet, return empty array
      return []
    }

    // Filter stats for this steamId and collect unique aliases
    const aliasMap = new Map<string, AliasRecord>()

    for (const stat of statsData.stats || []) {
      if (stat.steamId === steamId && stat.playerName) {
        const cleanName = stat.playerName.trim()

        if (aliasMap.has(cleanName)) {
          const existing = aliasMap.get(cleanName)!
          existing.timesUsed++
          existing.lastSeen = new Date(stat.playedAt)
        } else {
          aliasMap.set(cleanName, {
            alias: cleanName,
            firstSeen: new Date(stat.playedAt),
            lastSeen: new Date(stat.playedAt),
            timesUsed: 1,
          })
        }
      }
    }

    // Convert to array and sort by last seen (most recent first)
    const aliases = Array.from(aliasMap.values()).sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())

    return aliases
  } catch (error) {
    console.error("Error getting player aliases:", error)
    return []
  }
}

/**
 * Record a new alias usage
 * This is called when a player joins a server with a nickname
 */
export async function recordAliasUsage(steamId: string, alias: string): Promise<void> {
  // This will be automatically tracked through MatchStats
  // No need for separate tracking since we derive aliases from match data
}
