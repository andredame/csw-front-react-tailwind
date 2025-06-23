import { redirect } from "next/navigation"
import { cookies } from "next/headers"
// Update the import path below if the file name or location is different, e.g.:
// or
// import PrediosPage from "../../components/predios-page"
// import PrediosPage from "@/components/predios-page"

import PrediosPage from "@/components/predio-page"
import { checkUserRole } from "@/lib/auth-utils"

export default async function Predios() {
  const cookieStore = await  cookies()
  const token =  cookieStore.get("token")

  if (!token) {
    redirect("/login")
  }

  const hasPermission = await checkUserRole(["ADMIN", "COORDENADOR"], token.value)

  if (!hasPermission) {
    redirect("/unauthorized")
  }

  return <PrediosPage />
}
