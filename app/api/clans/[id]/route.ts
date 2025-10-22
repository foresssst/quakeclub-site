import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getClanById, deleteClan } from "@/lib/clans-storage"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const clan = getClanById(id)

    if (!clan) {
      return NextResponse.json({ error: "Clan no encontrado" }, { status: 404 })
    }

    return NextResponse.json(clan)
  } catch (error) {
    console.error("Error fetching clan:", error)
    return NextResponse.json({ error: "Error al obtener clan" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const success = deleteClan(id, session.user.id)

    if (!success) {
      return NextResponse.json({ error: "No se pudo eliminar el clan. Solo el líder puede hacerlo." }, { status: 403 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting clan:", error)
    return NextResponse.json({ error: "Error al eliminar clan" }, { status: 500 })
  }
}
