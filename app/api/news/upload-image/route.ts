import { type NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import { getSession } from "@/lib/auth"
import { sanitizeFilename, logSecurityEvent, getSecurityHeaders } from "@/lib/security"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user.isAdmin) {
      logSecurityEvent("UNAUTHORIZED_IMAGE_UPLOAD", { userId: session?.user.id })
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      logSecurityEvent("IMAGE_UPLOAD_REJECTED", {
        userId: session.user.id,
        reason: "file_too_large",
        size: file.size,
      })
      return NextResponse.json({ error: "La imagen es demasiado grande. Máximo 5MB" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      logSecurityEvent("IMAGE_UPLOAD_REJECTED", {
        userId: session.user.id,
        reason: "invalid_type",
        type: file.type,
      })
      return NextResponse.json({ error: "Tipo de archivo no permitido. Solo JPG, PNG, GIF y WebP" }, { status: 400 })
    }

    const sanitizedFilename = sanitizeFilename(file.name)
    if (!sanitizedFilename) {
      return NextResponse.json({ error: "Nombre de archivo inválido" }, { status: 400 })
    }

    // Create unique filename to avoid conflicts
    const timestamp = Date.now()
    const ext = path.extname(sanitizedFilename)
    const nameWithoutExt = path.basename(sanitizedFilename, ext)
    const uniqueFilename = `${nameWithoutExt}-${timestamp}${ext}`

    const uploadDir = path.join(process.cwd(), "public", "images", "news")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const savePath = path.join(uploadDir, uniqueFilename)
    if (!savePath.startsWith(uploadDir)) {
      logSecurityEvent("PATH_TRAVERSAL_ATTEMPT", {
        userId: session.user.id,
        filename: sanitizedFilename,
      })
      return NextResponse.json({ error: "Nombre de archivo inválido" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(savePath, buffer)

    const publicUrl = `/images/news/${uniqueFilename}`

    logSecurityEvent("IMAGE_UPLOAD_SUCCESS", {
      userId: session.user.id,
      filename: uniqueFilename,
      size: buffer.length,
    })

    const response = NextResponse.json({ url: publicUrl })
    const headers = getSecurityHeaders()
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  } catch (err) {
    console.error("[upload-image] Error processing upload:", err)
    logSecurityEvent("IMAGE_UPLOAD_ERROR", { error: String(err) })
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 })
  }
}
