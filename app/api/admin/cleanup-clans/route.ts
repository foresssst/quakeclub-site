import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient()

// Endpoint de limpieza: Eliminar TODOS los datos de clanes (JSON + PostgreSQL)
export async function POST() {
  try {
    const session = await getSession()

    // Solo admins pueden limpiar
    if (!session?.user.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const results = {
      postgres: {
        clansDeleted: 0,
        membersDeleted: 0,
        invitationsDeleted: 0,
      },
      json: {
        clansDeleted: 0,
        invitationsDeleted: 0,
        joinRequestsDeleted: 0,
      },
    }

    // Limpiar PostgreSQL
    try {
      // Eliminar invitaciones
      const invitations = await prisma.clanInvitation.deleteMany({})
      results.postgres.invitationsDeleted = invitations.count

      // Eliminar miembros
      const members = await prisma.clanMember.deleteMany({})
      results.postgres.membersDeleted = members.count

      // Eliminar clanes
      const clans = await prisma.clan.deleteMany({})
      results.postgres.clansDeleted = clans.count
    } catch (pgError) {
      console.error("Error cleaning PostgreSQL:", pgError)
    }

    // Limpiar archivos JSON
    const DATA_DIR = path.join(process.cwd(), "data")
    const CLANS_FILE = path.join(DATA_DIR, "clans.json")
    const INVITATIONS_FILE = path.join(DATA_DIR, "clan-invitations.json")
    const JOIN_REQUESTS_FILE = path.join(DATA_DIR, "clan-join-requests.json")

    try {
      // Contar y limpiar clanes
      if (fs.existsSync(CLANS_FILE)) {
        const clansData = JSON.parse(fs.readFileSync(CLANS_FILE, "utf-8"))
        results.json.clansDeleted = clansData.length
        fs.writeFileSync(CLANS_FILE, JSON.stringify([], null, 2))
      }

      // Contar y limpiar invitaciones
      if (fs.existsSync(INVITATIONS_FILE)) {
        const invitationsData = JSON.parse(fs.readFileSync(INVITATIONS_FILE, "utf-8"))
        results.json.invitationsDeleted = invitationsData.length
        fs.writeFileSync(INVITATIONS_FILE, JSON.stringify([], null, 2))
      }

      // Contar y limpiar solicitudes de unión
      if (fs.existsSync(JOIN_REQUESTS_FILE)) {
        const joinRequestsData = JSON.parse(fs.readFileSync(JOIN_REQUESTS_FILE, "utf-8"))
        results.json.joinRequestsDeleted = joinRequestsData.length
        fs.writeFileSync(JOIN_REQUESTS_FILE, JSON.stringify([], null, 2))
      }
    } catch (jsonError) {
      console.error("Error cleaning JSON files:", jsonError)
    }

    return NextResponse.json({
      message: "Limpieza completada exitosamente",
      results,
    })
  } catch (error) {
    console.error("Error during cleanup:", error)
    return NextResponse.json(
      { error: "Error al limpiar datos de clanes" },
      { status: 500 }
    )
  }
}
