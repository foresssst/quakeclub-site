import fs from "fs"
import path from "path"
import type { NewsItem } from "./news-data"
import { safeJsonParse, logSecurityEvent } from "./security"

const DATA_DIR = path.join(process.cwd(), "data")
const NEWS_FILE = path.join(DATA_DIR, "news.json")

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Load news from file
export function loadNews(): NewsItem[] {
  try {
    if (fs.existsSync(NEWS_FILE)) {
      const data = fs.readFileSync(NEWS_FILE, "utf-8")
      return safeJsonParse<NewsItem[]>(data, [])
    }
  } catch (error) {
    logSecurityEvent("NEWS_LOAD_ERROR", { error: String(error) })
    console.error("Error loading news:", error)
  }
  return []
}

// Save news to file
export function saveNews(news: NewsItem[]) {
  try {
    fs.writeFileSync(NEWS_FILE, JSON.stringify(news, null, 2))
  } catch (error) {
    console.error("Error saving news:", error)
    throw error
  }
}

// Get all news
export function getAllNews(): NewsItem[] {
  return loadNews().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Get single news by id
export function getNewsById(id: string): NewsItem | null {
  const news = loadNews()
  return news.find((item) => item.id === id) || null
}

// Create news
export function createNews(newsItem: Omit<NewsItem, "id">): NewsItem {
  const news = loadNews()
  const id = `news-${Date.now()}`
  const newItem: NewsItem = { ...newsItem, id }
  news.push(newItem)
  saveNews(news)
  return newItem
}

// Update news
export function updateNews(id: string, updates: Partial<NewsItem>): NewsItem | null {
  const news = loadNews()
  const index = news.findIndex((item) => item.id === id)
  if (index === -1) return null

  news[index] = { ...news[index], ...updates, id }
  saveNews(news)
  return news[index]
}

// Delete news
export function deleteNews(id: string): boolean {
  const news = loadNews()
  const filtered = news.filter((item) => item.id !== id)
  if (filtered.length === news.length) return false

  saveNews(filtered)
  return true
}
