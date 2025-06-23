import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  console.log("--- DEBUG: Logout API route hit ---"); // Debug 1

  try {
    const cookieStore = await cookies(); 
    const refreshToken = cookieStore.get("refreshToken")?.value;
    const idToken = cookieStore.get("id_token")?.value;

    const SPRING_BOOT_AUTH_LOGOUT_URL = process.env.SPRING_BOOT_AUTH_LOGOUT_URL;
    const KEYCLOAK_ISSUER_URL = process.env.KEYCLOAK_ISSUER_URL;
    const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    console.log("DEBUG: RefreshToken:", refreshToken ? "present" : "not present"); // Debug 2
    console.log("DEBUG: IDToken:", idToken ? "present" : "not present"); // Debug 3
    console.log("DEBUG: SPRING_BOOT_AUTH_LOGOUT_URL:", SPRING_BOOT_AUTH_LOGOUT_URL); // Debug 4
    console.log("DEBUG: KEYCLOAK_ISSUER_URL:", KEYCLOAK_ISSUER_URL); // Debug 5

    // Opcional: Chama o endpoint de logout da sua API Spring Boot para invalidar o refresh token no Keycloak
    if (refreshToken && SPRING_BOOT_AUTH_LOGOUT_URL) {
      console.log("DEBUG: Calling Spring Boot logout API..."); // Debug 6
      try {
        const backendLogoutResponse = await fetch(SPRING_BOOT_AUTH_LOGOUT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }), 
        });
        if (!backendLogoutResponse.ok) {
            console.error("DEBUG: Spring Boot logout API returned non-OK status:", backendLogoutResponse.status); // Debug 7
            const errorText = await backendLogoutResponse.text();
            console.error("DEBUG: Spring Boot logout API error response:", errorText); // Debug 8
        } else {
            console.log("DEBUG: Spring Boot logout API call successful."); // Debug 9
        }
      } catch (logoutError: any) {
        console.error("DEBUG: Error directly calling Spring Boot logout API:", logoutError.message || logoutError); // Debug 10
        // Não impede o logout local por causa de um erro no backend
      }
    } else {
        console.log("DEBUG: Not calling Spring Boot logout API (no refreshToken or URL)."); // Debug 11
    }

    // Limpa os cookies HTTP-only
    console.log("DEBUG: Clearing cookies..."); // Debug 12
    cookieStore.delete("token");
    cookieStore.delete("refreshToken");
    cookieStore.delete("id_token");
    console.log("DEBUG: Cookies cleared."); // Debug 13

    // Redireciona para o endpoint de logout do Keycloak para encerrar a sessão lá
    if (KEYCLOAK_ISSUER_URL) {
        const logoutUrl = new URL(`${KEYCLOAK_ISSUER_URL}/protocol/openid-connect/logout`);
        logoutUrl.searchParams.set('redirect_uri', NEXT_PUBLIC_BASE_URL); 
        if (idToken) {
            logoutUrl.searchParams.set('id_token_hint', idToken); 
        }
        console.log("DEBUG: Redirecting to Keycloak logout URL:", logoutUrl.toString()); // Debug 14
        return NextResponse.redirect(logoutUrl);
    }

    console.log("DEBUG: Returning JSON response (no Keycloak redirect)."); // Debug 15
    return NextResponse.json({ message: "Logout realizado com sucesso." });
  } catch (error: any) {
    console.error("--- DEBUG: Erro no bloco catch principal da rota de logout ---", error.message || error); // Debug 16
    return NextResponse.json({ message: "Erro interno do servidor durante o logout." }, { status: 500 });
  }
}