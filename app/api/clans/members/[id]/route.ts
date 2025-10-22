import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { removeMemberFromClan, leaveClan } from "@/lib/clans-storage"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: memberId } = await params
    const { clanId, action } = await request.json()

    if (action === "leave") {
      const success = leaveClan(clanId, session.user.id)
      if (!success) {
        return NextResponse.json({ error: "No se pudo salir del clan" }, { status: 400 })
      }
      return NextResponse.json({ success: true })
    } else if (action === "remove") {
      const success = removeMemberFromClan(clanId, memberId, session.user.id)
      if (!success) {
        return NextResponse.json(
          { error: "No se pudo remover al miembro. Solo el líder puede hacerlo." },
          { status: 403 },
        )
      }
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Acción inválida" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error managing member:", error)
    return NextResponse.json({ error: "Error al gestionar miembro" }, { status: 500 })
  }
}
