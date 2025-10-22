import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { updateClanAvatar } from "@/lib/clans-storage"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { logoUrl } = await request.json()
    const clanId = params.id

    if (!logoUrl) {
      return NextResponse.json({ error: "Falta la URL del avatar" }, { status: 400 })
    }

    const success = updateClanAvatar(clanId, session.user.id, logoUrl)

    if (!success) {
      return NextResponse.json(
        { error: "No se pudo actualizar el avatar. Verifica que seas el líder del clan." },
        { status: 400 },
      )
    }

    return NextResponse.json({ message: "Avatar actualizado correctamente" })
  } catch (error) {
    console.error("Error updating clan avatar:", error)
    return NextResponse.json({ error: "Error al actualizar avatar" }, { status: 500 })
  }
}
