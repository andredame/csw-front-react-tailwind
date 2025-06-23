import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import LoginForm from "@/components/login-form"

export default async function LoginPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")

  if (token) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-red-50">
      <LoginForm />
    </div>
  )
}
