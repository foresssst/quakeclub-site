import { NextRequest, NextResponse } from "next/server"
import openid from "openid"

const STEAM_OPENID_URL = "https://steamcommunity.com/openid"

export async function GET(request: NextRequest) {
  try {
    const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/steam/callback`
    const realm = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    const relyingParty = new openid.RelyingParty(
      returnUrl,
      realm,
      true, // Use stateless verification
      false, // Strict mode
      [],
    )

    // Get authentication URL
    return new Promise<NextResponse>((resolve, reject) => {
      relyingParty.authenticate(STEAM_OPENID_URL, false, (error, authUrl) => {
        if (error || !authUrl) {
          console.error("Steam auth error:", error)
          resolve(NextResponse.json({ error: "Failed to initiate Steam login" }, { status: 500 }))
          return
        }

        // Redirect to Steam login
        resolve(NextResponse.redirect(authUrl))
      })
    })
  } catch (error) {
    console.error("Steam auth error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
