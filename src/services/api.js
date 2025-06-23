// front/src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081",
  headers: {
    "Content-Type": "application/json",
  },
});

let onUnauthorizedCallback = null;
let refreshAccessTokenCallback = null;
let isRefreshing = false;
let failedRequests = [];

export const setOnUnauthorizedCallback = (callback) => { //
  onUnauthorizedCallback = callback;
};

export const setRefreshInterceptor = (callback) => { //
  refreshAccessTokenCallback = callback;
};

// DEFINIMOS OS CAMINHOS QUE NÃO DEVEM ENVIAR UM TOKEN DE AUTORIZAÇÃO
const AUTH_PATHS = ['/api/auth/login', '/api/auth/refresh'];

api.interceptors.request.use(
  (config) => {
    // Verifica se o caminho da requisição atual é um dos caminhos de autenticação
    const isAuthPath = AUTH_PATHS.some(path => config.url.endsWith(path));

    if (!isAuthPath) { // Se NÃO for um caminho de autenticação, adicione o cabeçalho Authorization
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null; //
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // Se for um caminho de autenticação, garanta que NENHUM cabeçalho Authorization esteja presente
      // Isso é importante caso ele tenha sido definido globalmente antes
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); //
  }
);

api.interceptors.response.use(
  (response) => response, //
  async (error) => {
    const originalRequest = error.config; //

    // Verifica se é um erro 401 e se a requisição original ainda não foi retentada
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Garante que isso só roda no cliente
      if (typeof window === 'undefined') {
        return Promise.reject(error);
      }

      // Verifica se a requisição original era para um caminho de autenticação (login/refresh)
      const isAuthPath = AUTH_PATHS.some(path => originalRequest.url.endsWith(path));
      if (isAuthPath) {
          // Se o próprio login/refresh falhou com 401, é uma falha final, então desloga
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          if (onUnauthorizedCallback) {
              onUnauthorizedCallback();
          }
          return Promise.reject(error);
      }


      if (isRefreshing) {
        // Se já houver um refresh em andamento, enfileira a requisição falha
        return new Promise(resolve => {
          failedRequests.push((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true; // Marca a requisição original como retentada
      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessTokenCallback(); // Chama a função de refresh do AuthContext
        isRefreshing = false;

        // Tenta novamente todas as requisições que estavam enfileiradas com o novo token
        failedRequests.forEach(callback => callback(newAccessToken));
        failedRequests = [];

        // Tenta novamente a requisição original falha com o novo token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Se o refresh falhar, limpa a fila, desativa o flag e aciona o logout
        failedRequests = [];
        isRefreshing = false;
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback(); // Aciona o logout
        }
        return Promise.reject(refreshError); // Rejeita a requisição original
      }
    }

    // Tratamento padrão para 401 (geralmente redundante agora, mas mantido como fallback)
    if (error.response?.status === 401) { //
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token"); //
        localStorage.removeItem("refreshToken"); // Limpa o refresh token no logout final
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback(); //
        } else {
          console.warn("Nenhum callback de não autorizado registrado. Redirecionando diretamente.");
          window.location.href = "/login"; //
        }
      }
    }

    return Promise.reject(error); //
  }
);

export default api;