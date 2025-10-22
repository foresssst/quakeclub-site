import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { acceptJoinRequest, rejectJoinRequest } from "@/lib/clans-storage"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { action } = await request.json()
    const { id: requestId } = await params

    if (action === "accept") {
      const success = acceptJoinRequest(requestId, session.user.id)
      if (!success) {
        return NextResponse.json({ error: "No se pudo aceptar la solicitud" }, { status: 400 })
      }
      return NextResponse.json({ message: "Solicitud aceptada" })
    } else if (action === "reject") {
      const success = rejectJoinRequest(requestId, session.user.id)
      if (!success) {
        return NextResponse.json({ error: "No se pudo rechazar la solicitud" }, { status: 400 })
      }
      return NextResponse.json({ message: "Solicitud rechazada" })
    }

    return NextResponse.json({ error: "Acción inválida" }, { status: 400 })
  } catch (error) {
    console.error("Error handling join request:", error)
    return NextResponse.json({ error: "Error al procesar solicitud" }, { status: 500 })
  }
}
