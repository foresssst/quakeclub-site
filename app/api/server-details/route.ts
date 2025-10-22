import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ip = searchParams.get("ip")
  const port = searchParams.get("port")

  if (!ip || !port) {
    return NextResponse.json({ error: "Missing ip or port" }, { status: 400 })
  }

  try {
    // Consulta la API de Syncore para obtener detalles del servidor
    const res = await fetch(`https://ql.syncore.org/api/servers?serverNames=${ip}%3A${port}`)
    const data = await res.json()

    if (!data.servers || data.servers.length === 0) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 })
    }

    const server = data.servers[0]

    return NextResponse.json({
      gameType: server.info?.gameType || "Quake Live",
      observers: server.info?.observers || 0,
      rules: {
        fraglimit: server.info?.fraglimit || "-",
        timelimit: server.info?.timelimit || "-",
        teamplay: server.info?.teamplay || "-",
        g_needpass: server.info?.g_needpass || "-",
        g_gametype: server.info?.g_gametype || "-",
      },
      lastMatch: server.info?.lastMatch || "Unknown",
    })
  } catch (error) {
    console.error("Error fetching server details:", error)
    return NextResponse.json({ error: "Failed to fetch server details" }, { status: 500 })
  }
}
