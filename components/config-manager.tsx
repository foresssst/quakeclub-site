"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Upload, Download, Search, Trash2, X } from "lucide-react"
import { useState } from "react"
import { useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  username: string
  isAdmin?: boolean
}

export function ConfigManager() {
  const [user, setUser] = useState<User | null>(null)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; fileName: string }>({
    show: false,
    fileName: "",
  })
  const [isClosing, setIsClosing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    }
    fetchUser()
  }, [])

  const handleUpload = () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith(".cfg")) {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", file)
      try {
        const res = await fetch("/api/upload-config", {
          method: "POST",
          body: formData,
        })
        if (res.ok) {
          const data = await res.json()
          fetchFiles()
        } else {
          const data = await res.json()
          alert(data.error || "Error al subir el archivo")
        }
      } catch (err) {
        alert("Error de red al subir el archivo")
      }
      setUploading(false)
    } else {
      alert("Por favor selecciona un archivo .cfg válido.")
    }
  }

  const handleDelete = async (fileName: string) => {
    setDeleteModal({ show: true, fileName })
    setIsClosing(false)
  }

  const closeModal = () => {
    setIsClosing(true)
    setTimeout(() => {
      setDeleteModal({ show: false, fileName: "" })
      setIsClosing(false)
    }, 200)
  }

  const confirmDelete = async () => {
    const fileName = deleteModal.fileName
    closeModal()

    try {
      const res = await fetch(`/api/delete-config?name=${encodeURIComponent(fileName)}`, {
        method: "DELETE",
      })

      if (res.ok) {
        fetchFiles()
      } else {
        const data = await res.json()
        alert(data.error || "Error al eliminar el archivo")
      }
    } catch (err) {
      alert("Error de red al eliminar el archivo")
    }
  }

  async function fetchFiles() {
    const res = await fetch("/api/list-configs")
    if (res.ok) {
      const data = await res.json()
      setFiles(data.files)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      {deleteModal.show && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
            isClosing ? "animate-fadeOut" : "animate-fadeIn"
          }`}
        >
          <div
            className={`relative w-full max-w-md rounded-lg border-2 border-white/20 bg-black/90 p-6 shadow-2xl transition-all duration-200 ${
              isClosing ? "animate-scaleOut" : "animate-scaleIn"
            }`}
          >
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="mb-4 text-xl font-bold text-white">Confirmar Eliminación</h3>
            <p className="mb-6 text-gray-300">
              ¿Estás seguro de que deseas eliminar{" "}
              <span className="font-semibold text-orange-400">{deleteModal.fileName}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 rounded-lg border-2 border-white/20 bg-transparent px-4 py-2 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-lg border-2 border-red-500 bg-red-500/20 px-4 py-2 font-semibold text-red-400 transition-colors hover:bg-red-500/30"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border-2 border-white/20 bg-black/40 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              {user ? `Bienvenido, ${user.username}` : "Subir Nueva Configuración"}
            </h3>
            <p className="text-sm text-gray-400">
              {user ? "Archivos .cfg únicamente" : "Inicia sesión para subir archivos"}
            </p>
          </div>
          {user && (
            <>
              <input
                type="file"
                accept=".cfg"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="border-2 border-white bg-transparent px-6 py-2 font-bold text-white transition-colors hover:bg-white/10"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Subiendo..." : "Subir Config"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar configuraciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border-2 border-white/20 bg-black/40 py-3 pl-12 pr-4 text-white placeholder-gray-500 backdrop-blur-sm transition-colors focus:border-orange-500/50 focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-lg border-2 border-white/20">
        <div className="border-b-2 border-white/20 bg-white/5 px-6 py-4">
          <div className="grid grid-cols-12 gap-4 text-sm font-bold uppercase tracking-wide text-gray-300">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-3">Nombre</div>
            <div className="col-span-2">Subido por</div>
            <div className="col-span-1">Tamaño</div>
            <div className="col-span-2">Fecha</div>
            <div className="col-span-1 text-center">Descargas</div>
            <div className="col-span-2 text-center">Acción</div>
          </div>
        </div>

        <div className="divide-y divide-white/10 bg-black/40 backdrop-blur-sm">
          {filteredFiles.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              {searchTerm ? "No se encontraron configuraciones" : "No hay configuraciones disponibles"}
            </div>
          ) : (
            filteredFiles.map((file, index) => (
              <div key={file.name} className="grid grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-white/5">
                <div className="col-span-1 flex items-center justify-center text-gray-500">{index + 1}.</div>
                <div className="col-span-3 flex items-center">
                  <span className="font-semibold text-white">{file.name}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-purple-400">{file.username || "Anónimo"}</span>
                </div>
                <div className="col-span-1 flex items-center text-gray-400">{file.size}</div>
                <div className="col-span-2 flex items-center text-gray-400">{file.uploadDate}</div>
                <div className="col-span-1 flex items-center justify-center">
                  <span className="font-bold text-orange-400">{file.downloads}</span>
                </div>
                <div className="col-span-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = `/api/get-config?name=${encodeURIComponent(file.name)}`
                      link.download = file.name
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    className="group flex items-center gap-1.5 text-white transition-all hover:text-gray-300"
                    title="Descargar"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-xs font-medium">Descargar</span>
                  </button>
                  {user && (file.userId === user.id || user.isAdmin) && (
                    <button
                      onClick={() => handleDelete(file.name)}
                      className="rounded p-1.5 text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
