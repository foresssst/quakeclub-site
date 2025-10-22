import { type NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import { getSession } from "@/lib/auth"
import {
  sanitizeFilename,
  validateConfigFile,
  logSecurityEvent,
  getSecurityHeaders,
  safeJsonParse,
} from "@/lib/security"

const MAX_FILE_SIZE = 100 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    console.log("[upload-config] POST received")

    const session = await getSession()
    if (!session) {
      console.log("[upload-config] No session found")
      return NextResponse.json({ error: "Debes iniciar sesión para subir archivos" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    console.log("[upload-config] formData keys:", Array.from(formData.keys()))

    if (!file) {
      console.log("[upload-config] No file found in formData")
      return NextResponse.json({ error: "Archivo no recibido" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      logSecurityEvent("UPLOAD_REJECTED", {
        userId: session.user.id,
        reason: "file_too_large",
        size: file.size,
      })
      return NextResponse.json(
        { error: `El archivo es demasiado grande. Máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 },
      )
    }

    const sanitizedFilename = sanitizeFilename(file.name)

    if (!sanitizedFilename || !sanitizedFilename.endsWith(".cfg")) {
      console.log("[upload-config] Invalid file name or extension:", sanitizedFilename)
      logSecurityEvent("UPLOAD_REJECTED", {
        userId: session.user.id,
        reason: "invalid_filename",
        originalName: file.name,
      })
      return NextResponse.json({ error: "Archivo inválido. Solo se permiten archivos .cfg" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const content = buffer.toString("utf-8")

    if (!validateConfigFile(content)) {
      logSecurityEvent("UPLOAD_REJECTED", {
        userId: session.user.id,
        reason: "invalid_content",
        filename: sanitizedFilename,
      })
      return NextResponse.json(
        { error: "El contenido del archivo no es válido. Solo se permiten archivos de texto." },
        { status: 400 },
      )
    }

    const dir = path.join(process.cwd(), "configs-database")
    if (!fs.existsSync(dir)) {
      console.log("[upload-config] configs-database not found, creating...")
      fs.mkdirSync(dir, { recursive: true })
    }

    const savePath = path.join(dir, sanitizedFilename)
    if (!savePath.startsWith(dir)) {
      logSecurityEvent("PATH_TRAVERSAL_ATTEMPT", {
        userId: session.user.id,
        filename: sanitizedFilename,
      })
      return NextResponse.json({ error: "Nombre de archivo inválido" }, { status: 400 })
    }

    fs.writeFileSync(savePath, buffer)
    console.log("[upload-config] File saved to", savePath, "size", buffer.length)

    const metadataPath = path.join(dir, "metadata.json")
    let metadata: any[] = []
    try {
      if (fs.existsSync(metadataPath)) {
        const data = fs.readFileSync(metadataPath, "utf8")
        metadata = safeJsonParse(data, [])
      }
    } catch (err) {
      console.log("[upload-config] Failed reading metadata.json, starting fresh", err)
      logSecurityEvent("METADATA_READ_ERROR", { error: String(err) })
      metadata = []
    }

    const now = new Date()
    const newMeta = {
      name: sanitizedFilename,
      size: `${(buffer.length / 1024).toFixed(2)} KB`,
      uploadDate: now.toISOString().slice(0, 10),
      downloads: 0,
      userId: session.user.id,
      username: session.user.username,
    }
    const idx = metadata.findIndex((m: any) => m.name === sanitizedFilename)
    if (idx >= 0) metadata[idx] = newMeta
    else metadata.push(newMeta)

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
    console.log("[upload-config] metadata updated")

    logSecurityEvent("UPLOAD_SUCCESS", {
      userId: session.user.id,
      filename: sanitizedFilename,
      size: buffer.length,
    })

    const response = NextResponse.json({ success: true, fileName: sanitizedFilename })
    const headers = getSecurityHeaders()
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  } catch (err) {
    console.error("[upload-config] Error processing upload:", err)
    logSecurityEvent("UPLOAD_ERROR", { error: String(err) })
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
