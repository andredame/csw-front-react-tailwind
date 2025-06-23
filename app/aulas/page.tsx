import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import AulasPage from "@/components/aulas-page"
import { checkUserRole } from "@/lib/auth-utils"

export default async function Aulas() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")

  if (!token) {
    redirect("/login")
  }

  const hasPermission = await checkUserRole(["PROFESSOR"], token.value)

  if (!hasPermission) {
    redirect("/unauthorized")
  }

  return <AulasPage />
}
