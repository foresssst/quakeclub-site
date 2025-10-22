import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProfileContent } from "@/components/profile-content"
import Image from "next/image"

export default async function ProfilePage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="relative min-h-screen bg-black">
      <div className="fixed inset-0 animate-gradient-flow bg-gradient-to-br from-purple-900/60 via-black to-orange-900/60 bg-[length:200%_200%]" />

      <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
        <div className="animate-float opacity-40">
          <Image
            src="/quad.png"
            alt=""
            width={800}
            height={450}
            className="h-auto w-full max-w-4xl object-contain blur-sm"
            priority
          />
        </div>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12">
        <ProfileContent user={session.user} />
      </main>
    </div>
  )
}
