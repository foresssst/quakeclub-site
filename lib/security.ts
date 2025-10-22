// Security utilities for rate limiting, input sanitization, and validation

import * as path from "path"

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(identifier: string, maxAttempts = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return true
  }

  if (entry.count >= maxAttempts) {
    return false
  }

  entry.count++
  return true
}

export function sanitizeFilename(filename: string): string {
  // Remove any path separators and dangerous characters
  return filename
    .replace(/[/\\]/g, "") // Remove slashes
    .replace(/\.\./g, "") // Remove parent directory references
    .replace(/[<>:"|?*\x00-\x1f]/g, "") // Remove invalid filename characters
    .replace(/^\.+/, "") // Remove leading dots
    .trim()
    .substring(0, 255) // Limit length
}

export function sanitizeUsername(username: string): string {
  // Allow only alphanumeric, underscore, and hyphen
  return username
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .trim()
    .substring(0, 50)
}

export function sanitizeMarkdown(content: string): string {
  // Remove potentially dangerous HTML tags and scripts
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove event handlers
    .trim()
}

export function validateConfigFile(content: string): boolean {
  try {
    // Check if content is valid UTF-8 text
    const buffer = Buffer.from(content, "utf-8")
    const decoded = buffer.toString("utf-8")

    // Check for null bytes (binary files)
    if (decoded.includes("\0")) {
      return false
    }

    // Check if content is reasonable length
    if (content.length === 0 || content.length > 100 * 1024 * 1024) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export function validateNewsContent(
  title: string,
  content: string,
  excerpt: string,
): { valid: boolean; error?: string } {
  // Validate title
  if (!title || title.trim().length === 0) {
    return { valid: false, error: "El título es requerido" }
  }
  if (title.length > 200) {
    return { valid: false, error: "El título es demasiado largo (máximo 200 caracteres)" }
  }

  // Validate content
  if (!content || content.trim().length === 0) {
    return { valid: false, error: "El contenido es requerido" }
  }
  if (content.length > 50000) {
    return { valid: false, error: "El contenido es demasiado largo (máximo 50,000 caracteres)" }
  }

  // Validate excerpt
  if (!excerpt || excerpt.trim().length === 0) {
    return { valid: false, error: "El extracto es requerido" }
  }
  if (excerpt.length > 500) {
    return { valid: false, error: "El extracto es demasiado largo (máximo 500 caracteres)" }
  }

  return { valid: true }
}

export function logSecurityEvent(event: string, details: any) {
  const timestamp = new Date().toISOString()
  console.log(`[SECURITY] ${timestamp} - ${event}:`, JSON.stringify(details))
}

export function getSecurityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  }
}

export function generateSecureToken(): string {
  // Generate cryptographically secure random token
  const array = new Uint8Array(32)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback for Node.js
    const nodeCrypto = require("crypto")
    nodeCrypto.randomFillSync(array)
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export function isPathSafe(basePath: string, targetPath: string): boolean {
  const resolvedBase = path.resolve(basePath)
  const resolvedTarget = path.resolve(targetPath)
  return resolvedTarget.startsWith(resolvedBase)
}

export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    logSecurityEvent("JSON_PARSE_ERROR", { error: String(error) })
    return fallback
  }
}
