// src/api/authApi.ts
import { httpClient } from "./httpClient";

export interface LoginResponse {
  access: string; // ajusta si tu backend devuelve 'token' u otro nombre
  refresh: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const resp = await httpClient.post<LoginResponse>("/api/v1/auth/login", {
    username,
    password,
  });

  return resp.data;
}







































/*const API_BASE_URL = "http://127.0.0.1:8000"; // ajusta si tu backend usa otra URL

export interface LoginResponse {
  access: string; // o 'token' si tu backend lo llama así
  user: {
    id: number;
    username: string;
    nombre_completo?: string;
  };
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const resp = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!resp.ok) {
    throw new Error("Credenciales inválidas o error en el servidor");
  }

  const data = await resp.json();
  return data as LoginResponse;
}
*/  
