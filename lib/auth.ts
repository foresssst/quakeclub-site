import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import fs from "fs"
import path from "path"
import { generateSecureToken, safeJsonParse, logSecurityEvent } from "./security"

export interface User {
  id: string
  steamId?: string // Steam ID64 for Steam login users
  username: string
  isAdmin?: boolean
  avatar?: string
  createdAt?: number
}

export interface Session {
  user: User
  expiresAt: number
}

const DATA_DIR = path.join(process.cwd(), "data")
const USERS_FILE = path.join(DATA_DIR, "users.json")
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json")

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Load users from file
function loadUsers(): Map<
  string,
  { username: string; passwordHash?: string; steamId?: string; id: string; isAdmin?: boolean; avatar?: string; createdAt?: number }
> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8")
      const usersArray = safeJsonParse<Array<[string, any]>>(data, [])
      return new Map(usersArray)
    }
  } catch (error) {
    logSecurityEvent("USERS_LOAD_ERROR", { error: String(error) })
    console.error("Error loading users:", error)
  }
  return new Map()
}

// Save users to file
function saveUsers(
  users: Map<string, { username: string; passwordHash?: string; steamId?: string; id: string; isAdmin?: boolean; avatar?: string; createdAt?: number }>,
) {
  try {
    const usersArray = Array.from(users.entries())
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersArray, null, 2))
  } catch (error) {
    console.error("Error saving users:", error)
  }
}

// Load sessions from file
function loadSessions(): Map<string, Session> {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, "utf-8")
      const sessionsArray = safeJsonParse<Array<[string, Session]>>(data, [])
      const now = Date.now()
      const validSessions = sessionsArray.filter(([_, session]) => session.expiresAt > now)
      return new Map(validSessions)
    }
  } catch (error) {
    logSecurityEvent("SESSIONS_LOAD_ERROR", { error: String(error) })
    console.error("Error loading sessions:", error)
  }
  return new Map()
}

// Save sessions to file
function saveSessions(sessions: Map<string, Session>) {
  try {
    const sessionsArray = Array.from(sessions.entries())
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessionsArray, null, 2))
  } catch (error) {
    console.error("Error saving sessions:", error)
  }
}

const users = loadUsers()
const sessions = loadSessions()

// Initialize demo user if not exists
// if (!users.has("demo")) {
//   const demoPasswordHash = bcrypt.hashSync("demo123", 10)
//   users.set("demo", { username: "demo", passwordHash: demoPasswordHash, id: "1", isAdmin: false })
//   saveUsers(users)
// }

if (!users.has("operador")) {
  const adminPasswordHash = bcrypt.hashSync("quakeclub@2025", 10)
  users.set("operador", { username: "operador", passwordHash: adminPasswordHash, id: "admin-1", isAdmin: true })
  saveUsers(users)
}

export async function createUser(username: string, password: string): Promise<User | null> {
  if (users.has(username)) {
    return null // User already exists
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const id = Date.now().toString()
  users.set(username, { username, passwordHash, id, isAdmin: false })
  saveUsers(users) // Save to file after creating user
  return { id, username, isAdmin: false }
}

export async function verifyUser(username: string, password: string): Promise<User | null> {
  const user = users.get(username)
  if (!user) {
    return null
  }

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    return null
  }

  const isAdmin = username === "operador"
  return { id: user.id, username: user.username, isAdmin, avatar: user.avatar }
}

export function createSession(user: User): string {
  const sessionId = generateSecureToken()
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days

  sessions.set(sessionId, { user, expiresAt })
  saveSessions(sessions)
  return sessionId
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (!sessionId) {
    return null
  }

  const session = sessions.get(sessionId)
  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      logSecurityEvent("SESSION_EXPIRED", { sessionId })
    }
    sessions.delete(sessionId)
    saveSessions(sessions)
    return null
  }

  // Reload user data from users.json to get latest avatar and other updates
  const usersMap = loadUsers()
  let freshUser: User | null = null

  if (session.user.steamId) {
    // Find user by steamId
    for (const user of usersMap.values()) {
      if (user.steamId === session.user.steamId) {
        freshUser = {
          id: user.id,
          steamId: user.steamId,
          username: user.username,
          isAdmin: user.isAdmin || false,
          avatar: user.avatar,
          createdAt: user.createdAt,
        }
        break
      }
    }
  } else {
    // Find user by username (for non-Steam users like admin)
    const user = usersMap.get(session.user.username)
    if (user) {
      freshUser = {
        id: user.id,
        steamId: user.steamId,
        username: user.username,
        isAdmin: user.isAdmin || false,
        avatar: user.avatar,
        createdAt: user.createdAt,
      }
    }
  }

  if (!freshUser) {
    // User not found in users.json, session is invalid
    sessions.delete(sessionId)
    saveSessions(sessions)
    return null
  }

  // Return session with fresh user data
  return {
    user: freshUser,
    expiresAt: session.expiresAt,
  }
}

export function deleteSession(sessionId: string) {
  sessions.delete(sessionId)
  saveSessions(sessions) // Save to file after deleting session
}

export function getAllUsers(): Array<{ id: string; username: string; isAdmin: boolean; avatar?: string }> {
  const usersMap = loadUsers()
  return Array.from(usersMap.values()).map((user) => ({
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin || false,
    avatar: user.avatar,
  }))
}

export function deleteUser(userId: string): boolean {
  const usersMap = loadUsers()
  let found = false

  for (const [username, user] of usersMap.entries()) {
    if (user.id === userId) {
      // Prevent deleting the main admin
      if (username === "operador") {
        return false
      }
      usersMap.delete(username)
      found = true
      break
    }
  }

  if (found) {
    saveUsers(usersMap)
  }
  return found
}

export function updateUserAdmin(userId: string, isAdmin: boolean): boolean {
  const usersMap = loadUsers()
  let found = false

  for (const [username, user] of usersMap.entries()) {
    if (user.id === userId) {
      // Prevent modifying the main admin
      if (username === "operador") {
        return false
      }
      user.isAdmin = isAdmin
      usersMap.set(username, user)
      found = true
      break
    }
  }

  if (found) {
    saveUsers(usersMap)
  }
  return found
}

export function updateUserAvatar(userId: string, avatarUrl: string): boolean {
  const usersMap = loadUsers()
  let found = false

  for (const [username, user] of usersMap.entries()) {
    if (user.id === userId) {
      user.avatar = avatarUrl
      usersMap.set(username, user)
      found = true
      break
    }
  }

  if (found) {
    saveUsers(usersMap)
  }
  return found
}

export function getUserById(userId: string): User | null {
  const usersMap = loadUsers()

  for (const user of usersMap.values()) {
    if (user.id === userId) {
      return {
        id: user.id,
        steamId: user.steamId,
        username: user.username,
        isAdmin: user.isAdmin || false,
        avatar: user.avatar,
        createdAt: user.createdAt,
      }
    }
  }

  return null
}

// Find user by Steam ID
export function getUserBySteamId(steamId: string): User | null {
  const usersMap = loadUsers()

  for (const user of usersMap.values()) {
    if (user.steamId === steamId) {
      return {
        id: user.id,
        steamId: user.steamId,
        username: user.username,
        isAdmin: user.isAdmin || false,
        avatar: user.avatar,
        createdAt: user.createdAt,
      }
    }
  }

  return null
}

// Create or update user from Steam login
export function createOrUpdateSteamUser(steamId: string, username: string, avatar?: string): User {
  const usersMap = loadUsers()

  // Check if user already exists by steamId
  for (const [key, user] of usersMap.entries()) {
    if (user.steamId === steamId) {
      // Update username and avatar if provided
      user.username = username
      if (avatar) {
        user.avatar = avatar
      }
      usersMap.set(key, user)
      saveUsers(usersMap)
      return {
        id: user.id,
        steamId: user.steamId,
        username: user.username,
        isAdmin: user.isAdmin || false,
        avatar: user.avatar,
        createdAt: user.createdAt,
      }
    }
  }

  // Create new user
  const id = `steam_${steamId}`
  const createdAt = Date.now()
  const newUser = {
    id,
    steamId,
    username,
    avatar,
    isAdmin: false,
    createdAt,
  }

  usersMap.set(steamId, newUser)
  saveUsers(usersMap)

  return {
    id,
    steamId,
    username,
    isAdmin: false,
    avatar,
    createdAt,
  }
}
