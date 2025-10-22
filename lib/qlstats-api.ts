// QLStats API integration
export interface QLStatsPlayer {
  steamId: string
  nick: string
  model: string
  playTime: number
  games: number
  wins: number
  losses: number
  kills: number
  deaths: number
  elo: number
  rank: number
}

export interface QLStatsMatch {
  gameId: string
  map: string
  gameType: string
  timestamp: number
  result: "win" | "loss" | "draw"
  score: string
  kills: number
  deaths: number
}

export interface QLStatsAlias {
  name: string
  lastSeen: string
  gamesPlayed: number
}

// Fetch player stats from QLStats
export async function fetchPlayerStats(steamId: string): Promise<QLStatsPlayer | null> {
  try {
    // QLStats API endpoint (using public data)
    const response = await fetch(`https://qlstats.net/player/${steamId}`, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      return null
    }

    const html = await response.text()

    // Parse the HTML to extract stats (QLStats doesn't have a public JSON API)
    // We'll extract data from the page structure
    const stats = parseQLStatsHTML(html, steamId)
    return stats
  } catch (error) {
    console.error("Error fetching QLStats data:", error)
    return null
  }
}

// Parse QLStats HTML to extract player data
function parseQLStatsHTML(html: string, steamId: string): QLStatsPlayer | null {
  try {
    // Extract player nickname
    const nickMatch = html.match(/<h2[^>]*>([^<]+)<\/h2>/)
    const nick = nickMatch ? nickMatch[1].trim() : "Unknown"

    // Extract games played
    const gamesMatch = html.match(/Games Played[^>]*>(\d+)/)
    const games = gamesMatch ? Number.parseInt(gamesMatch[1]) : 0

    // Extract wins
    const winsMatch = html.match(/Wins[^>]*>(\d+)/)
    const wins = winsMatch ? Number.parseInt(winsMatch[1]) : 0

    // Extract kills
    const killsMatch = html.match(/Kills[^>]*>(\d+)/)
    const kills = killsMatch ? Number.parseInt(killsMatch[1]) : 0

    // Extract deaths
    const deathsMatch = html.match(/Deaths[^>]*>(\d+)/)
    const deaths = deathsMatch ? Number.parseInt(deathsMatch[1]) : 0

    return {
      steamId,
      nick,
      model: "sarge",
      playTime: games * 15, // Estimate 15 min per game
      games,
      wins,
      losses: games - wins,
      kills,
      deaths,
      elo: 1500, // Default ELO
      rank: 0,
    }
  } catch (error) {
    console.error("Error parsing QLStats HTML:", error)
    return null
  }
}

// Fetch recent matches
export async function fetchRecentMatches(steamId: string): Promise<QLStatsMatch[]> {
  try {
    const response = await fetch(`https://qlstats.net/player/${steamId}`)

    if (!response.ok) {
      return []
    }

    const html = await response.text()
    return parseRecentMatches(html)
  } catch (error) {
    console.error("Error fetching recent matches:", error)
    return []
  }
}

function parseRecentMatches(html: string): QLStatsMatch[] {
  // Parse recent matches from HTML
  // This is a simplified version - you'd need to parse the actual match table
  return []
}

// Fetch player aliases from QLStats
export async function fetchPlayerAliases(steamId: string): Promise<QLStatsAlias[]> {
  try {
    // QLStats aliases endpoint
    const response = await fetch(`https://qlstats.net/aliases/${steamId}`, {
      headers: {
        Accept: "text/html",
      },
    })

    if (!response.ok) {
      console.log("[v0] QLStats aliases fetch failed:", response.status)
      return []
    }

    const html = await response.text()
    return parseQLStatsAliases(html)
  } catch (error) {
    console.error("Error fetching QLStats aliases:", error)
    return []
  }
}

// Parse QLStats aliases HTML to extract alias data
function parseQLStatsAliases(html: string): QLStatsAlias[] {
  try {
    const aliases: QLStatsAlias[] = []

    // QLStats aliases page has a table with alias data
    // Look for table rows with alias information
    const tableRowRegex =
      /<tr[^>]*>[\s\S]*?<td[^>]*>([^<]+)<\/td>[\s\S]*?<td[^>]*>([^<]+)<\/td>[\s\S]*?<td[^>]*>(\d+)<\/td>[\s\S]*?<\/tr>/g

    let match
    while ((match = tableRowRegex.exec(html)) !== null) {
      const name = match[1].trim()
      const lastSeen = match[2].trim()
      const gamesPlayed = Number.parseInt(match[3])

      // Skip header rows and invalid data
      if (name && name !== "Nickname" && !name.includes("class=")) {
        aliases.push({
          name,
          lastSeen,
          gamesPlayed,
        })
      }
    }

    // If regex parsing fails, try alternative parsing
    if (aliases.length === 0) {
      // Look for simpler pattern - just extract nicknames from the page
      const nicknameRegex = /<td class="player-nick"[^>]*>([^<]+)<\/td>/g
      const dateRegex = /<td class="player-date"[^>]*>([^<]+)<\/td>/g
      const gamesRegex = /<td class="player-games"[^>]*>(\d+)<\/td>/g

      const nicknames: string[] = []
      const dates: string[] = []
      const games: number[] = []

      let nickMatch
      while ((nickMatch = nicknameRegex.exec(html)) !== null) {
        nicknames.push(nickMatch[1].trim())
      }

      let dateMatch
      while ((dateMatch = dateRegex.exec(html)) !== null) {
        dates.push(dateMatch[1].trim())
      }

      let gamesMatch
      while ((gamesMatch = gamesRegex.exec(html)) !== null) {
        games.push(Number.parseInt(gamesMatch[1]))
      }

      // Combine the arrays
      for (let i = 0; i < nicknames.length; i++) {
        aliases.push({
          name: nicknames[i],
          lastSeen: dates[i] || "Unknown",
          gamesPlayed: games[i] || 0,
        })
      }
    }

    console.log("[v0] Parsed aliases from QLStats:", aliases.length)
    return aliases
  } catch (error) {
    console.error("Error parsing QLStats aliases:", error)
    return []
  }
}
