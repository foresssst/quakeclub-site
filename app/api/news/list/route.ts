import { NextResponse } from "next/server"
import { getAllNews } from "@/lib/news-storage"

export async function GET() {
  try {
    const news = getAllNews()
    return NextResponse.json({ news })
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}
