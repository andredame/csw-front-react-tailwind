import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // URL da sua API Spring Boot de login - MANTIDA FIXA CONFORME SUA PREFERÊNCIA
    const SPRING_BOOT_AUTH_LOGIN_URL = "http://localhost:8081/api/auth/login"; //

    if (!SPRING_BOOT_AUTH_LOGIN_URL) {
      return NextResponse.json({ message: "URL de login da API Spring Boot não configurada." }, { status: 500 });
    }

    // Chama o endpoint de login da sua API Spring Boot
    const authResponse = await fetch(SPRING_BOOT_AUTH_LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      return NextResponse.json({ message: errorData.message || "Credenciais inválidas ou erro no servidor de autenticação." }, { status: authResponse.status });
    }

    const { access_token, refresh_token, expires_in, id_token, user_info } = await authResponse.json();

    const user = {
      id: user_info?.id || 'id-não-disponível',
      username: user_info?.username || username, 
      email: user_info?.email || username, 
      roles: user_info?.roles || [], 
    };

    const cookieStore = await cookies(); 

    cookieStore.set("token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expires_in, 
      path: "/",
    });

    if (refresh_token) {
        cookieStore.set("refreshToken", refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: expires_in * 2, 
            path: "/",
        });
    }

    if (id_token) { 
        cookieStore.set("id_token", id_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: expires_in,
            path: "/",
        });
    }

    return NextResponse.json({ user });
    
  } catch (error) {
    console.error("Erro no processo de login/autenticação:", error);
    return NextResponse.json({ message: "Erro interno do servidor ao tentar login." }, { status: 500 });
  }
}