import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import ClassManagement from "@/components/class-management"

export default async function ClassesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")

  if (!token) {
    redirect("/login")
  }

  return <ClassManagement />
}
