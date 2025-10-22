import openid from "openid"

const STEAM_OPENID_URL = "https://steamcommunity.com/openid"
const STEAM_API_URL = "https://api.steampowered.com"

interface SteamUser {
  steamId: string
  username: string
  avatar: string
  profileUrl: string
}

// Extract Steam ID from OpenID identifier
export function extractSteamId(identifier: string): string | null {
  const match = identifier.match(/\/id\/(\d+)/)
  return match ? match[1] : null
}

// Get Steam user info from Steam API
export async function getSteamUserInfo(steamId: string): Promise<SteamUser | null> {
  const apiKey = process.env.STEAM_API_KEY
  if (!apiKey) {
    throw new Error("STEAM_API_KEY not configured")
  }

  try {
    const url = `${STEAM_API_URL}/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`
    const response = await fetch(url)
    const data = await response.json()

    if (!data.response || !data.response.players || data.response.players.length === 0) {
      return null
    }

    const player = data.response.players[0]
    return {
      steamId: player.steamid,
      username: player.personaname,
      avatar: player.avatarfull || player.avatarmedium || player.avatar,
      profileUrl: player.profileurl,
    }
  } catch (error) {
    console.error("Error fetching Steam user info:", error)
    return null
  }
}

// Create RelyingParty for Steam OpenID
export function createRelyingParty(returnUrl: string) {
  const relyingParty = new openid.RelyingParty(
    returnUrl, // Verification URL (callback)
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", // Realm
    true, // Use stateless verification
    false, // Strict mode
    [],
  )

  return relyingParty
}

// Verify OpenID assertion
export function verifyAssertion(
  request: Request,
): Promise<{ authenticated: boolean; claimedIdentifier?: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(request.url)
    const returnUrl = `${url.origin}${url.pathname}`
    const relyingParty = createRelyingParty(returnUrl)

    // Convert URL search params to object
    const params: Record<string, string> = {}
    url.searchParams.forEach((value, key) => {
      params[key] = value
    })

    relyingParty.verifyAssertion(params, (error, result) => {
      if (error) {
        reject(error)
        return
      }

      if (!result || !result.authenticated) {
        resolve({ authenticated: false })
        return
      }

      resolve({
        authenticated: true,
        claimedIdentifier: result.claimedIdentifier,
      })
    })
  })
}
