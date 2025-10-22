import fs from "fs"
import path from "path"
import { safeJsonParse, logSecurityEvent } from "./security"

export interface ConfigFile {
  id: string
  name: string
  size: string
  uploadDate: string
  downloads: number
  userId: string
  username: string
  content: string
}

const DATA_DIR = path.join(process.cwd(), "data")
const CONFIGS_FILE = path.join(DATA_DIR, "configs.json")

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Load configs from file
function loadConfigs(): Map<string, ConfigFile> {
  try {
    if (fs.existsSync(CONFIGS_FILE)) {
      const data = fs.readFileSync(CONFIGS_FILE, "utf-8")
      const configsArray = safeJsonParse<Array<[string, ConfigFile]>>(data, [])
      return new Map(configsArray)
    }
  } catch (error) {
    logSecurityEvent("CONFIGS_LOAD_ERROR", { error: String(error) })
    console.error("Error loading configs:", error)
  }
  return new Map()
}

// Save configs to file
function saveConfigs(configs: Map<string, ConfigFile>) {
  try {
    const configsArray = Array.from(configs.entries())
    fs.writeFileSync(CONFIGS_FILE, JSON.stringify(configsArray, null, 2))
  } catch (error) {
    console.error("Error saving configs:", error)
  }
}

const configs = loadConfigs()

// Initialize with placeholder if empty
if (configs.size === 0) {
  configs.set("placeholder.cfg", {
    id: "1",
    name: "placeholder.cfg",
    size: "2.5 KB",
    uploadDate: "15/01/2025",
    downloads: 150,
    userId: "system",
    username: "system",
    content: "// Placeholder config file",
  })
  saveConfigs(configs)
}

export function getAllConfigs(): ConfigFile[] {
  return Array.from(configs.values())
}

export function getConfig(name: string): ConfigFile | undefined {
  return configs.get(name)
}

export function createConfig(config: Omit<ConfigFile, "id" | "downloads">): ConfigFile {
  const id = Date.now().toString()
  const newConfig: ConfigFile = {
    ...config,
    id,
    downloads: 0,
  }
  configs.set(config.name, newConfig)
  saveConfigs(configs) // Save to file after creating config
  return newConfig
}

export function deleteConfig(name: string, userId: string): boolean {
  const config = configs.get(name)
  if (!config || config.userId !== userId) {
    return false
  }
  const deleted = configs.delete(name)
  if (deleted) {
    saveConfigs(configs) // Save to file after deleting config
  }
  return deleted
}

export function incrementDownloads(name: string) {
  const config = configs.get(name)
  if (config) {
    config.downloads++
    saveConfigs(configs) // Save to file after incrementing downloads
  }
}
