import { NextResponse } from "next/server"
import { getSession, updateUserAvatar } from "@/lib/auth"
import fs from "fs"
import path from "path"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB para GIFs y fotos bonitas!
const AVATARS_DIR = path.join(process.cwd(), "public", "avatars")

// Ensure avatars directory exists
if (!fs.existsSync(AVATARS_DIR)) {
  fs.mkdirSync(AVATARS_DIR, { recursive: true })
}

export async function POST(request: Request) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { avatarData } = await request.json()

    if (!avatarData || typeof avatarData !== "string") {
      return NextResponse.json({ error: "Datos de avatar inválidos" }, { status: 400 })
    }

    // Check if it's a base64 image
    if (!avatarData.startsWith("data:image/")) {
      return NextResponse.json({ error: "Formato de imagen inválido" }, { status: 400 })
    }

    // Extract base64 data and extension
    const matches = avatarData.match(/^data:image\/(png|jpg|jpeg|gif|webp);base64,(.+)$/)
    if (!matches) {
      return NextResponse.json({ error: "Formato de imagen inválido" }, { status: 400 })
    }

    const ext = matches[1]
    const base64Data = matches[2]
    const buffer = Buffer.from(base64Data, "base64")

    // Check file size (max 10MB)
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 },
      )
    }

    // Generate filename
    const filename = `${session.user.id}_${Date.now()}.${ext}`
    const filepath = path.join(AVATARS_DIR, filename)

    // Save file
    fs.writeFileSync(filepath, buffer)

    // Update user avatar in database (save relative URL)
    const avatarUrl = `/avatars/${filename}`
    const success = updateUserAvatar(session.user.id, avatarUrl)

    if (!success) {
      // Clean up file if database update fails
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
      return NextResponse.json({ error: "Error al actualizar avatar" }, { status: 500 })
    }

    // Delete old avatar if exists
    if (session.user.avatar && session.user.avatar.startsWith("/avatars/")) {
      const oldFilepath = path.join(process.cwd(), "public", session.user.avatar)
      if (fs.existsSync(oldFilepath)) {
        fs.unlinkSync(oldFilepath)
      }
    }

    return NextResponse.json({ success: true, avatarUrl })
  } catch (error) {
    console.error("Error updating avatar:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
