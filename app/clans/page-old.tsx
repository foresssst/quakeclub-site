import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Users, Shield } from "lucide-react"
import { getSession } from "@/lib/auth"
import { getClanByUserId } from "@/lib/clans-storage"
import { ClansList } from "@/components/clans-list"
import { CreateClanDialog } from "@/components/create-clan-dialog"
import { MyClanCard } from "@/components/my-clan-card"
import { ClanInvitationsInbox } from "@/components/clan-invitations-inbox"

export default async function ClansPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const userClan = getClanByUserId(session.user.id)

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 animate-gradient-flow bg-gradient-to-br from-purple-900/30 via-black to-orange-900/30 bg-[length:200%_200%]" />

      <div className="relative z-10">
        <div className="border-b border-white/10 bg-black/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 transition-all duration-300 hover:translate-x-[-4px] hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Volver al Menú</span>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="mb-12 text-center animate-fade-up">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <Shield className="h-12 w-12 text-purple-400" />
              <h1 className="text-6xl font-bold text-white font-goldman">Clanes</h1>
              <Shield className="h-12 w-12 text-orange-400" />
            </div>
            <p className="text-xl text-gray-400 mb-4">Únete a un clan o crea el tuyo propio</p>
            <div className="mx-auto h-1 w-32 bg-gradient-to-r from-purple-500 via-white to-orange-500"></div>
          </div>

          <div className="animate-fade-up [animation-delay:100ms]">
            <ClanInvitationsInbox />
          </div>

          <div className="animate-fade-up [animation-delay:200ms]">
            {userClan ? (
              <MyClanCard clan={userClan} userId={session.user.id} />
            ) : (
              <div className="mb-12 flex justify-center">
                <div className="text-center space-y-6 p-8 border border-white/10 bg-black/60 backdrop-blur-sm max-w-2xl">
                  <Users className="mx-auto h-16 w-16 text-purple-400" />
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-goldman">No perteneces a ningún clan</h2>
                    <p className="text-gray-400">Crea tu propio clan o espera una invitación</p>
                  </div>
                  <CreateClanDialog />
                </div>
              </div>
            )}
          </div>

          <div className="animate-fade-up [animation-delay:300ms]">
            <ClansList currentUserId={session.user.id} userClanId={userClan?.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
