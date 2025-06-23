import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = cookies()
    cookieStore.delete("token")

    return NextResponse.json({ message: "Logout realizado com sucesso" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
