// front/src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api/data", // Altere isso para a nova rota de proxy do Next.js
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Ainda necessário para o navegador enviar os cookies httpOnly para o Next.js
});

api.interceptors.request.use(
  (config) => {
    // Para as rotas de autenticação (login, logout, me) que são do próprio Next.js
    // Elas precisam acessar diretamente os endpoints internos do Next.js (/api/auth/...)
    if (config.url.startsWith('/api/auth')) {
      config.baseURL = '/api'; // Aponta para a raiz das APIs internas do Next.js
    } else {
      config.baseURL = '/api/data'; // Para todas as outras chamadas de dados, use o proxy
    }
    
    // Remova qualquer cabeçalho Authorization que possa ter sido adicionado anteriormente.
    // O proxy do Next.js irá lidar com a adição do token Bearer.
    delete config.headers.Authorization;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Se a API Next.js de proxy retornar 401, o AuthProvider do Next.js
    // já deve estar configurado para lidar com o redirecionamento.
    if (error.response?.status === 401) {
      console.warn("API request received 401. Relying on Next.js AuthProvider for session management and redirection.");
    }
    return Promise.reject(error);
  }
);

export default api;