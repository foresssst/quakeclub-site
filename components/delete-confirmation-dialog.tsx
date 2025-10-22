"use client"

import { AlertTriangle } from "lucide-react"

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  itemName?: string
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
}: DeleteConfirmationDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md animate-fade-in rounded-lg border border-red-500/30 bg-black/95 p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            {itemName && <p className="font-roboto text-sm text-gray-400">"{itemName}"</p>}
          </div>
        </div>

        <p className="font-roboto mb-6 text-gray-300">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="font-roboto flex-1 border border-white/20 bg-white/5 px-4 py-2.5 text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="font-roboto flex-1 border border-red-500/50 bg-red-500/20 px-4 py-2.5 font-semibold text-red-400 transition-all duration-300 hover:border-red-500 hover:bg-red-500/30"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
