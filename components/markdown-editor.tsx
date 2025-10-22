"use client"

import type React from "react"

import { useState, useRef, type ChangeEvent } from "react"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  Smile,
  Code,
  Heading1,
  Heading2,
  Quote,
  HelpCircle,
} from "lucide-react"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const EMOJI_LIST = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😛",
  "😝",
  "😜",
  "🤪",
  "🤨",
  "🧐",
  "🤓",
  "😎",
  "🤩",
  "🥳",
  "😏",
  "😒",
  "😞",
  "😔",
  "😟",
  "😕",
  "🙁",
  "😣",
  "😖",
  "😫",
  "😩",
  "🥺",
  "😢",
  "😭",
  "😤",
  "😠",
  "😡",
  "🤬",
  "🤯",
  "😳",
  "🥵",
  "🥶",
  "😱",
  "😨",
  "😰",
  "😥",
  "😓",
  "🤗",
  "🤔",
  "🤭",
  "🤫",
  "🤥",
  "😶",
  "😐",
  "😑",
  "😬",
  "🙄",
  "😯",
  "😦",
  "😧",
  "😮",
  "😲",
  "🥱",
  "😴",
  "🤤",
  "😪",
  "😵",
  "🤐",
  "🥴",
  "🤢",
  "🤮",
  "🤧",
  "😷",
  "🤒",
  "🤕",
  "🤑",
  "🤠",
  "👍",
  "👎",
  "👌",
  "✌️",
  "🤞",
  "🤟",
  "🤘",
  "🤙",
  "👈",
  "👉",
  "👆",
  "👇",
  "☝️",
  "👏",
  "🙌",
  "👐",
  "🤲",
  "🤝",
  "🙏",
  "✍️",
  "💪",
  "🦾",
  "🦿",
  "🦵",
  "🦶",
  "👂",
  "🦻",
  "👃",
  "🧠",
  "🫀",
  "🫁",
  "🦷",
  "🦴",
  "👀",
  "👁️",
  "👅",
  "👄",
  "💋",
  "🩸",
  "🔥",
  "💥",
  "💫",
  "💦",
  "💨",
  "🎮",
  "🎯",
  "🎲",
  "🎰",
  "🎳",
  "🏆",
  "🥇",
  "🥈",
  "🥉",
  "⚽",
  "🏀",
  "🏈",
  "⚾",
  "🥎",
  "🎾",
  "🏐",
  "🏉",
  "🥏",
  "🎱",
  "🪀",
  "🏓",
  "🏸",
  "🏒",
  "🏑",
  "🥍",
  "🏏",
  "🪃",
  "🥅",
  "⛳",
  "🪁",
  "🏹",
  "🎣",
  "🤿",
  "🥊",
  "🥋",
  "🎽",
  "🛹",
  "🛼",
  "⛸️",
  "🥌",
  "🎿",
  "⛷️",
  "🏂",
  "🪂",
  "🏋️",
  "🤼",
  "🤸",
  "🤺",
  "⛹️",
  "🤾",
  "🏌️",
  "🏇",
  "🧘",
  "🏄",
  "🏊",
  "🤽",
  "🚣",
  "🧗",
  "🚴",
  "🚵",
  "🎪",
  "🎭",
  "🎨",
  "🎬",
  "🎤",
  "🎧",
  "🎼",
  "🎹",
  "🥁",
  "🪘",
  "🎷",
  "🎺",
  "🪗",
  "🎸",
  "🪕",
  "🎻",
  "🎲",
  "♟️",
  "🎯",
  "🎳",
  "🎮",
  "🎰",
  "🧩",
]

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertText = (before: string, after = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault()
        const blob = items[i].getAsFile()
        if (!blob) continue

        await uploadImage(blob, "imagen-pegada.png")
        break
      }
    }
  }

  const uploadImage = async (file: File, defaultName: string) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/news/upload-image", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        insertText(`![${file.name || defaultName}](${data.url})`)
      } else {
        const error = await res.json()
        alert(error.error || "Error al subir la imagen")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error al subir la imagen")
    } finally {
      setUploading(false)
    }
  }

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    await uploadImage(file, file.name)
    // Reset input so the same file can be uploaded again
    e.target.value = ""
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-white/20 bg-black/40 p-2">
        <button
          type="button"
          onClick={() => insertText("**", "**")}
          className="rounded p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Negrita"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText("*", "*")}
          className="rounded p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Cursiva"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText("# ", "")}
          className="rounded p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Título 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText("## ", "")}
          className="rounded p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Título 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText("- ", "")}
          className="rounded p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Lista"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText("1. ", "")}
          className="rounded p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText("[texto](url)", "")}
          className="rounded p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Enlace"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText("> ", "")}
          className="rounded p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Cita"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText("`", "`")}
          className="rounded p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Código"
        >
          <Code className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-white/20" />

        <label
          className={`cursor-pointer rounded p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white ${uploading ? "opacity-50" : ""}`}
        >
          <ImageIcon className="h-4 w-4" />
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
        </label>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="rounded p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            title="Emojis"
          >
            <Smile className="h-4 w-4" />
          </button>
          {showEmojiPicker && (
            <div className="absolute left-0 top-full z-50 mt-1 h-64 w-80 overflow-y-auto rounded-lg border border-white/20 bg-black/95 p-2 shadow-xl backdrop-blur-sm">
              <div className="grid grid-cols-8 gap-1">
                {EMOJI_LIST.map((emoji, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      insertText(emoji)
                      setShowEmojiPicker(false)
                    }}
                    className="rounded p-2 text-xl transition-colors hover:bg-white/10"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mx-1 h-6 w-px bg-white/20" />

        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="rounded p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Guía de Markdown"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {uploading && <span className="ml-2 text-xs text-orange-400 animate-pulse">Subiendo imagen...</span>}
      </div>

      {showGuide && (
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4 text-sm">
          <h4 className="mb-2 font-bold text-orange-400">Guía rápida de Markdown</h4>
          <div className="grid gap-2 text-gray-300 md:grid-cols-2">
            <div>
              <code className="text-orange-300">**negrita**</code> → <strong>negrita</strong>
            </div>
            <div>
              <code className="text-orange-300">*cursiva*</code> → <em>cursiva</em>
            </div>
            <div>
              <code className="text-orange-300"># Título 1</code> → Título grande
            </div>
            <div>
              <code className="text-orange-300">## Título 2</code> → Título mediano
            </div>
            <div>
              <code className="text-orange-300">- Item</code> → Lista con viñetas
            </div>
            <div>
              <code className="text-orange-300">1. Item</code> → Lista numerada
            </div>
            <div>
              <code className="text-orange-300">[texto](url)</code> → Enlace
            </div>
            <div>
              <code className="text-orange-300">![alt](url)</code> → Imagen
            </div>
            <div>
              <code className="text-orange-300">`código`</code> → Código inline
            </div>
            <div>
              <code className="text-orange-300">&gt; cita</code> → Cita
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            💡 Tip: Puedes pegar imágenes directamente con Ctrl+V o usar el botón de imagen para subirlas. Las imágenes
            se guardan en el servidor.
          </p>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        className="w-full rounded-b-lg border border-white/20 bg-black/40 px-4 py-3 font-mono text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-black/60"
        placeholder={placeholder}
        rows={15}
        disabled={uploading}
      />
    </div>
  )
}
