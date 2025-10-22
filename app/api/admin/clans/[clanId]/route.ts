import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { deleteClan, getClanById } from "@/lib/clans-storage"

export async function DELETE(request: Request, { params }: { params: Promise<{ clanId: string }> }) {
  try {
    const session = await getSession()
    if (!session?.user.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { clanId } = await params

    const clan = getClanById(clanId)
    if (!clan) {
      return NextResponse.json({ error: "Clan no encontrado" }, { status: 404 })
    }

    // Admin can delete any clan, so we pass the leader ID to bypass the check
    const success = deleteClan(clanId, clan.leaderId)

    if (!success) {
      return NextResponse.json({ error: "Error al eliminar clan" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting clan:", error)
    return NextResponse.json({ error: "Error al eliminar clan" }, { status: 500 })
  }
}
