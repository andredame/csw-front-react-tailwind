import { type NextRequest, NextResponse } from "next/server"
import { SignJWT } from "jose"
import { cookies } from "next/headers"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

// Mock user data - replace with your actual authentication logic
const mockUsers = [
  {
    id: "1",
    username: "edgardossantos@edu.pucrs.br",
    password: "123456",
    email: "edgardossantos@edu.pucrs.br",
    roles: ["ADMIN"],
  },
  {
    id: "2",
    username: "mariaeduarda@edu.pucrs.br",
    password: "123456",
    email: "mariaeduarda@edu.pucrs.br",
    roles: ["COORDENADOR"],
  },
  {
    id: "3",
    username: "john@edu.pucrs.br",
    password: "123456",
    email: "john@edu.pucrs.br",
    roles: ["PROFESSOR"],
  },
  {
    id: "4",
    username: "andresilva@edu.pucrs.br",
    password: "123456",
    email: "andresilva@edu.pucrs.br",
    roles: ["ALUNO"],
  },
]

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Find user - replace with your actual authentication logic
    const user = mockUsers.find((u) => u.username === username && u.password === password)

    if (!user) {
      return NextResponse.json({ message: "Credenciais inválidas" }, { status: 401 })
    }

    // Create JWT token
    const token = await new SignJWT({
      sub: user.id,
      preferred_username: user.username,
      email: user.email,
      realm_access: { roles: user.roles },
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET)

    // Set httpOnly cookie
    const cookieStore = cookies()
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
