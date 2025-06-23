import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")

    if (!token) {
      return NextResponse.json({ message: "Token não encontrado" }, { status: 401 })
    }

    const user = await verifyToken(token.value)

    if (!user) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
