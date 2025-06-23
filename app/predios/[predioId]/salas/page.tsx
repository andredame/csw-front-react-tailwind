import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import SalasPage from "@/components/salas-page"
import { checkUserRole } from "@/lib/auth-utils"

interface Props {
  params: {
    predioId: string
  }
}

export default async function Salas({ params }: Props) {
  const cookieStore =  await cookies()
  const token = cookieStore.get("token")

  if (!token) {
    redirect("/login")
  }

  const hasPermission = await checkUserRole(["ADMIN", "COORDENADOR"], token.value)

  if (!hasPermission) {
    redirect("/unauthorized")
  }

  return <SalasPage predioId={params.predioId} />
}
