import type React from "react"
export const quakeColorMap: Record<string, string> = {
  "0": "#000000", // Black
  "1": "#FF0000", // Red
  "2": "#00FF00", // Green
  "3": "#FFFF00", // Yellow
  "4": "#0000FF", // Blue
  "5": "#00FFFF", // Cyan
  "6": "#FF00FF", // Magenta/Pink
  "7": "#FFFFFF", // White
}

export function parseQuakeColors(text: string): React.ReactNode {
  if (!text) return text

  const parts: React.ReactNode[] = []
  let currentColor = "#FFFFFF"
  let currentText = ""
  let i = 0

  while (i < text.length) {
    if (text[i] === "^" && i + 1 < text.length && /[0-7]/.test(text[i + 1])) {
      // Save current text with current color
      if (currentText) {
        parts.push(
          <span key={parts.length} style={{ color: currentColor }}>
            {currentText}
          </span>,
        )
        currentText = ""
      }
      // Update color
      currentColor = quakeColorMap[text[i + 1]] || "#FFFFFF"
      i += 2
    } else {
      currentText += text[i]
      i++
    }
  }

  // Add remaining text
  if (currentText) {
    parts.push(
      <span key={parts.length} style={{ color: currentColor }}>
        {currentText}
      </span>,
    )
  }

  return parts.length > 0 ? <>{parts}</> : text
}
