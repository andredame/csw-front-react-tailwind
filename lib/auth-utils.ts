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

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: KEYCLOAK_ISSUER,
      // audience: KEYCLOAK_CLIENT_ID_FOR_AUDIENCE, 
    });
    console.log("Payload do token verificado:", payload); // Log do payload para depuração

    const roles = (payload.realm_access as any)?.roles || []; 

    const username = payload.preferred_username as string || payload.name as string || 'Usuário';
    console.log("Nome de usuário extraído:", username); // Log do nome de usuário para depuração
    const user: User = {
      id: payload.sub as string,
      username: username,
      email: payload.email as string,
      roles: roles,
    };

    return user;
  } catch (error: any) { // Adicionado 'any' para capturar o tipo de erro
    // --- ADIÇÃO PARA DEPURAR: Log do erro detalhado na verificação do token ---
    console.error("Erro detalhado na verificação do token Keycloak:", error.message || error);
    if (error.code) {
        console.error("Código do erro JOSE:", error.code);
    }
    // --- Fim da adição ---
    return null;
  }
}

export function hasRole(userRoles: string[], role: string): boolean {
  return userRoles.includes(role);
}

export async function checkUserRole(requiredRoles: string[], token: string): Promise<boolean> {
  const user = await verifyToken(token)

  if (!user) return false

  return requiredRoles.some((role) => user.roles.includes(role))
}

export function hasAnyRole(userRoles: string[], roles: string[]): boolean {
  return roles.some((role) => userRoles.includes(role));
}