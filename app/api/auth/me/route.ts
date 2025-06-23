import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify, createRemoteJWKSet } from "jose"; 

const KEYCLOAK_JWKS_URL = new URL(process.env.KEYCLOAK_JWKS_URI || "http://localhost:8080/realms/sarc/protocol/openid-connect/certs");
const KEYCLOAK_ISSUER = process.env.KEYCLOAK_ISSUER_URL || "http://localhost:8080/realms/sarc";
const KEYCLOAK_CLIENT_ID_FOR_AUDIENCE = process.env.KEYCLOAK_CLIENT_ID; 

const JWKS = createRemoteJWKSet(KEYCLOAK_JWKS_URL);

export interface User {
  id: string
  username: string
  email: string
  roles: string[]
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies(); 
    const token = cookieStore.get("token")?.value; 

    if (!token) {
      return NextResponse.json({ message: "Token não encontrado." }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: KEYCLOAK_ISSUER,
      // audience: KEYCLOAK_CLIENT_ID_FOR_AUDIENCE, 
    });

    const roles = (payload.realm_access as any)?.roles || []; 

    const username = payload.preferred_username as string || payload.name as string || 'Usuário';

    const user: User = {
      id: payload.sub as string,
      username: username,
      email: payload.email as string,
      roles: roles,
    };

    if (!user.id) { 
      return NextResponse.json({ message: "Token inválido ou sem informações de usuário." }, { status: 401 });
    }

    // --- Adição para depuração: Imprimir o objeto do usuário ---
    console.log("Usuário buscado e informações:", user.email, user.roles);
    // --- Fim da adição para depuração ---

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Erro na verificação de autenticação:", error);
    return NextResponse.json({ message: "Token inválido ou expirado." }, { status: 401 });
  }
}