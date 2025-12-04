// src/api/httpClient.ts
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000"; // ajusta si usas otra URL

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adjuntar el token en cada petición
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

// Más adelante aquí podemos agregar interceptores de respuesta (401, etc.)
