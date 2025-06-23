import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import RecursosPage from "@/components/recursos-page"
import { checkUserRole } from "@/lib/auth-utils"

export default async function Recursos() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")

  if (!token) {
    redirect("/login")
  }

  const hasPermission = await checkUserRole(["ADMIN", "COORDENADOR"], token.value)

  if (!hasPermission) {
    redirect("/unauthorized")
  }

  return <RecursosPage />
}
