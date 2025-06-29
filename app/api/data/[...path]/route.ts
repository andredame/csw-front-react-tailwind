import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const SPRING_BOOT_BASE_URL = "http://localhost:8081"; // Verifique se esta é a URL correta da sua API Spring Boot

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await await cookies();
    const token = cookieStore.get("token")?.value; // Pega o token httpOnly do cookie

    if (!token) {
      // Se não houver token, retorna 401 (Não Autorizado)
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    // Extrai o caminho dinâmico da URL da requisição (ex: /predios/count)
    const urlPath = request.nextUrl.pathname.replace("/api/data", "");
    const backendUrl = `${SPRING_BOOT_BASE_URL}${urlPath}${request.nextUrl.search}`;

    console.log("Proxying GET request to backend:", backendUrl);

    // Faz a requisição para o backend Spring Boot, adicionando o cabeçalho Authorization
    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Adiciona o token JWT como Bearer
        // Adicione outros cabeçalhos se necessário (ex: 'Accept': 'application/json')
      },
    });

    if (!backendResponse.ok) {
      // Retorna o status e a mensagem de erro do backend se a requisição falhar
      const errorText = await backendResponse.text();
      console.error(`Backend returned non-OK status (${backendResponse.status}):`, errorText);
      return NextResponse.json({ message: `Backend error: ${errorText}` }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data); // Retorna a resposta do backend para o cliente

  } catch (error: any) {
    console.error("Error in proxied API route (GET):", error);
    return NextResponse.json({ message: "Internal server error during proxying." }, { status: 500 });
  }
}

// Para requisições POST, PUT, DELETE, você precisará adicionar funções semelhantes:
export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const urlPath = request.nextUrl.pathname.replace("/api/data", "");
    const backendUrl = `${SPRING_BOOT_BASE_URL}${urlPath}${request.nextUrl.search}`;
    const requestBody = await request.json(); // Pega o corpo da requisição do cliente

    console.log("Proxying POST request to backend:", backendUrl);

    const backendResponse = await fetch(backendUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody), // Envia o corpo da requisição
    });

    if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error(`Backend returned non-OK status (${backendResponse.status}):`, errorText);
        return NextResponse.json({ message: `Backend error: ${errorText}` }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const urlPath = request.nextUrl.pathname.replace("/api/data", "");
    const backendUrl = `${SPRING_BOOT_BASE_URL}${urlPath}${request.nextUrl.search}`;

    let requestBody = null; // Declare requestBody como nulo por padrão
    // CORREÇÃO: Tente ler o body apenas se o Content-Type for application/json
    try {
      if (request.headers.get("content-type")?.includes("application/json")) {
        requestBody = await request.json();
      }
    } catch (e) {
      console.warn("PUT: No valid JSON body or empty body detected. Continuing without body.", e);
      requestBody = null; // Garante que seja nulo se houver erro ao parsear
    }

    console.log("Proxying PUT request to backend:", backendUrl);

    const fetchOptions: RequestInit = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", // Mantenha isso se o backend espera Content-Type JSON
        "Authorization": `Bearer ${token}`,
      },
      // CORREÇÃO: Só inclua o body se requestBody não for nulo
      ...(requestBody !== null && { body: JSON.stringify(requestBody) }),
    };

    const backendResponse = await fetch(backendUrl, fetchOptions);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Backend returned non-OK status (${backendResponse.status}):`, errorText);
      return NextResponse.json({ message: `Backend error: ${errorText}` }, { status: backendResponse.status });
    }

    // Tenta parsear a resposta como JSON (com fallback para vazio se não for JSON)
    try {
      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch {
      return new NextResponse(null, { status: backendResponse.status });
    }
}

// Exemplo para DELETE:
export async function DELETE(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const urlPath = request.nextUrl.pathname.replace("/api/data", "");
    const backendUrl = `${SPRING_BOOT_BASE_URL}${urlPath}${request.nextUrl.search}`;

    console.log("Proxying DELETE request to backend:", backendUrl);

    const backendResponse = await fetch(backendUrl, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error(`Backend returned non-OK status (${backendResponse.status}):`, errorText);
        return NextResponse.json({ message: `Backend error: ${errorText}` }, { status: backendResponse.status });
    }

    // Para DELETE, geralmente não há corpo na resposta (ou um JSON vazio)
    return new NextResponse(null, { status: backendResponse.status });
}