import { NextResponse } from "next/server"
import { getAllUsers } from "@/lib/auth"

export async function GET() {
  try {
    const users = getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
  }
}
