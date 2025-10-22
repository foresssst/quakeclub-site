"use client"

import { useRouter } from "next/navigation"
import { User, LogOut, Shield, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserProfileDropdownProps {
  username: string
  isAdmin?: boolean
  avatarUrl?: string
}

export function UserProfileDropdown({ username, isAdmin, avatarUrl }: UserProfileDropdownProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch (err) {
      alert("Error al cerrar sesión")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white/5 focus:outline-none">
        {avatarUrl ? (
          <img src={avatarUrl || "/placeholder.svg"} alt={username} className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
            <span className="text-xs font-medium text-white/90">{username[0].toUpperCase()}</span>
          </div>
        )}
        <span className="text-sm text-white/80">{username}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 border-white/20 bg-black/95 backdrop-blur-md">
        <DropdownMenuItem
          onClick={() => router.push("/profile")}
          className="cursor-pointer text-gray-300 focus:bg-white/10 focus:text-white"
        >
          <User className="mr-2 h-4 w-4" />
          Mi Perfil
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/clans")}
          className="cursor-pointer text-gray-300 focus:bg-white/10 focus:text-white"
        >
          <Users className="mr-2 h-4 w-4" />
          Clanes
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={() => router.push("/admin")}
              className="cursor-pointer text-orange-400 focus:bg-orange-500/10 focus:text-orange-300"
            >
              <Shield className="mr-2 h-4 w-4" />
              Panel Admin
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
