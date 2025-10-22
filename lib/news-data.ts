export interface NewsItem {
  id: string
  title: string
  date: string
  excerpt: string
  content: string
  author: string
  image?: string
}

export const newsItems: NewsItem[] = []
