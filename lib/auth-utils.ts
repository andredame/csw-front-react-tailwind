import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

export interface User {
  id: string
  username: string
  email: string
  roles: string[]
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    return {
      id: payload.sub as string,
      username: payload.preferred_username as string,
      email: payload.email as string,
      roles: (payload.realm_access as any)?.roles || [],
    }
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export async function checkUserRole(requiredRoles: string[], token: string): Promise<boolean> {
  const user = await verifyToken(token)

  if (!user) return false

  return requiredRoles.some((role) => user.roles.includes(role))
}

export function hasRole(userRoles: string[], role: string): boolean {
  return userRoles.includes(role)
}

export function hasAnyRole(userRoles: string[], roles: string[]): boolean {
  return roles.some((role) => userRoles.includes(role))
}
