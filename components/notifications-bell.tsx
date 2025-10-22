"use client"

import { useEffect, useState } from "react"
import { Bell, Check, X, Mail, UserPlus } from "lucide-react"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ClanInvitation {
  id: string
  clanId: string
  clanName: string
  fromUserId: string
  fromUsername: string
  toUserId: string
  toUsername: string
  status: string
  createdAt: number
}

interface ClanJoinRequest {
  id: string
  clanId: string
  clanName: string
  fromUserId: string
  fromUsername: string
  status: string
  createdAt: number
}

export function NotificationsBell() {
  const router = useRouter()
  const [count, setCount] = useState(0)
  const [invitations, setInvitations] = useState<ClanInvitation[]>([])
  const [joinRequests, setJoinRequests] = useState<ClanJoinRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const [countRes, invitationsRes, joinRequestsRes] = await Promise.all([
        fetch("/api/notifications/count"),
        fetch("/api/clans/invitations"),
        fetch("/api/clans/join-requests/my-clan"),
      ])

      if (countRes.ok) {
        const countData = await countRes.json()
        setCount(countData.count || 0)
      }

      if (invitationsRes.ok) {
        const invitationsData = await invitationsRes.json()
        setInvitations(invitationsData || [])
      }

      if (joinRequestsRes.ok) {
        const joinRequestsData = await joinRequestsRes.json()
        setJoinRequests(joinRequestsData.requests || [])
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvitation = async (invitationId: string, action: "accept" | "reject") => {
    setProcessingId(invitationId)
    try {
      const response = await fetch(`/api/clans/invitations/${invitationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al procesar invitación")
      }

      await fetchNotifications()
      router.refresh()

      if (action === "accept") {
        alert("Te has unido al clan exitosamente")
      }
    } catch (error) {
      console.error("Error processing invitation:", error)
      alert(error instanceof Error ? error.message : "Error al procesar la invitación")
    } finally {
      setProcessingId(null)
    }
  }

  const handleJoinRequest = async (requestId: string, action: "accept" | "reject") => {
    setProcessingId(requestId)
    try {
      const response = await fetch(`/api/clans/join-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al procesar solicitud")
      }

      await fetchNotifications()
      router.refresh()

      if (action === "accept") {
        alert("Miembro agregado al clan exitosamente")
      }
    } catch (error) {
      console.error("Error processing join request:", error)
      alert(error instanceof Error ? error.message : "Error al procesar la solicitud")
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Ahora"
    if (diffMins < 60) return `Hace ${diffMins}m`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
  }

  const totalNotifications = invitations.length + joinRequests.length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative inline-flex items-center justify-center transition-colors hover:text-purple-400"
          aria-label={`Notificaciones${totalNotifications > 0 ? ` (${totalNotifications})` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {totalNotifications > 0 && (
            <>
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                {totalNotifications > 9 ? "9+" : totalNotifications}
              </span>
              <span className="absolute -right-1 -top-1 h-4 w-4 animate-ping rounded-full bg-red-600 opacity-75"></span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 bg-[#0a0a0f] border-gray-800 p-0" align="end">
        <div className="border-b border-gray-800 p-4 bg-gradient-to-r from-purple-900/20 to-orange-900/20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-400" />
              Notificaciones
            </h3>
            {totalNotifications > 0 && (
              <span className="text-xs text-white bg-red-600 px-2 py-1 rounded-full font-semibold">
                {totalNotifications} pendiente{totalNotifications > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <Tabs defaultValue="invitations" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-[#0a0a0f] border-b border-gray-800 rounded-none">
            <TabsTrigger value="invitations" className="data-[state=active]:bg-purple-600/20">
              Invitaciones {invitations.length > 0 && `(${invitations.length})`}
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-orange-600/20">
              Solicitudes {joinRequests.length > 0 && `(${joinRequests.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invitations" className="m-0">
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-500" />
                </div>
              ) : invitations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Bell className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-sm font-medium text-gray-400 mb-1">No hay invitaciones</p>
                  <p className="text-xs text-gray-600">Las invitaciones de clan aparecerán aquí</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="p-4 hover:bg-gray-900/50 transition-colors">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-orange-600 text-sm font-bold text-white shrink-0">
                          {invitation.fromUsername[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white mb-1">
                            <span className="font-semibold text-purple-400">{invitation.fromUsername}</span> te invitó a{" "}
                            <span className="font-semibold text-orange-400">{invitation.clanName}</span>
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(invitation.createdAt)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleInvitation(invitation.id, "accept")}
                          disabled={processingId === invitation.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInvitation(invitation.id, "reject")}
                          disabled={processingId === invitation.id}
                          className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent h-8 text-xs"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="m-0">
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
                </div>
              ) : joinRequests.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <UserPlus className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-sm font-medium text-gray-400 mb-1">No hay solicitudes</p>
                  <p className="text-xs text-gray-600">Las solicitudes para unirse aparecerán aquí</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {joinRequests.map((request) => (
                    <div key={request.id} className="p-4 hover:bg-gray-900/50 transition-colors">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-purple-600 text-sm font-bold text-white shrink-0">
                          {request.fromUsername[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white mb-1">
                            <span className="font-semibold text-orange-400">{request.fromUsername}</span> quiere unirse
                            a tu clan
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleJoinRequest(request.id, "accept")}
                          disabled={processingId === request.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleJoinRequest(request.id, "reject")}
                          disabled={processingId === request.id}
                          className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent h-8 text-xs"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {totalNotifications > 0 && (
          <div className="border-t border-gray-800 p-3">
            <Link
              href="/clanes"
              onClick={() => setOpen(false)}
              className="block w-full text-center text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Ver todas las notificaciones
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
