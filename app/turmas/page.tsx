import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import TurmasPage from "@/components/turmas-page"
import { checkUserRole } from "@/lib/auth-utils"

export default async function Turmas() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")

  if (!token) {
    redirect("/login")
  }

  const hasPermission = await checkUserRole(["PROFESSOR", "COORDENADOR"], token.value)

  if (!hasPermission) {
    redirect("/unauthorized")
  }

  return <TurmasPage />
}
