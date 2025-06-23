import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import ReservasPage from "@/components/reservas-page"
import { checkUserRole } from "@/lib/auth-utils"

export default async function Reservas() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")

  if (!token) {
    redirect("/login")
  }

  const hasPermission = await checkUserRole(["PROFESSOR"], token.value)

  if (!hasPermission) {
    redirect("/unauthorized")
  }

  return <ReservasPage />
}
