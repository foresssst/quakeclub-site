import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import openid from "openid"
import { createOrUpdateSteamUser, createSession } from "@/lib/auth"
import { getSteamUserInfo } from "@/lib/steam-auth"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)

    // Use the configured site URL for production (behind proxy)
    const realm = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const returnUrl = `${realm}/api/auth/steam/callback`

    const relyingParty = new openid.RelyingParty(returnUrl, realm, true, false, [])

    // Build the verification URL with realm instead of request.url
    // This handles proxy scenarios where request.url might be localhost
    const verifyUrl = `${returnUrl}?${url.searchParams.toString()}`

    // Verify the assertion using the constructed URL
    const result = await new Promise<{ authenticated: boolean; claimedIdentifier?: string }>(
      (resolve, reject) => {
        relyingParty.verifyAssertion(verifyUrl, (error, result) => {
          if (error) {
            console.error("OpenID verification error:", error)
            reject(error)
            return
          }
          if (!result) {
            resolve({ authenticated: false })
            return
          }
          resolve({
            authenticated: result.authenticated || false,
            claimedIdentifier: result.claimedIdentifier,
          })
        })
      },
    )

    if (!result.authenticated || !result.claimedIdentifier) {
      return NextResponse.redirect(`${realm}/login?error=auth_failed`)
    }

    // Extract Steam ID from the claimed identifier
    // Format: https://steamcommunity.com/openid/id/76561198801465771
    const steamIdMatch = result.claimedIdentifier.match(/\/id\/(\d+)/)
    if (!steamIdMatch) {
      return NextResponse.redirect(`${realm}/login?error=invalid_steam_id`)
    }

    const steamId = steamIdMatch[1]

    // Get Steam user info
    const steamUser = await getSteamUserInfo(steamId)
    if (!steamUser) {
      return NextResponse.redirect(`${realm}/login?error=steam_api_failed`)
    }

    // Create or update user
    const user = createOrUpdateSteamUser(steamId, steamUser.username, steamUser.avatar)

    // Create session
    const sessionId = createSession(user)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Redirect to profile or home
    return NextResponse.redirect(`${realm}/profile`)
  } catch (error) {
    console.error("Steam callback error:", error)
    const realm = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    return NextResponse.redirect(`${realm}/login?error=callback_failed`)
  }
}
