// src/api/proveedoresApi.ts
import { httpClient } from "./httpClient";

export type EstadoProveedor = "ACTIVO" | "INACTIVO";

export interface Proveedor {
  id: number;
  nombre: string;
  nit?: string | null;
  cui?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  estado?: EstadoProveedor;
}

export interface ProveedoresPaginadosResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Proveedor[];
}

export interface ProveedorFormValues {
  nombre: string;
  nit?: string;
  cui?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  estado?: EstadoProveedor; // IMPORTANTE
}

// Endpoint real (confirmado)
const BASE_URL = "/api/v1/catalogos/proveedores/";

export async function listarProveedores(params?: {
  search?: string;
  page?: number;
}): Promise<ProveedoresPaginadosResponse> {
  const resp = await httpClient.get<ProveedoresPaginadosResponse>(BASE_URL, { params });
  return resp.data;
}

export async function crearProveedor(data: ProveedorFormValues): Promise<Proveedor> {
  const resp = await httpClient.post<Proveedor>(BASE_URL, data);
  return resp.data;
}

export async function actualizarProveedor(
  id: number,
  data: ProveedorFormValues
): Promise<Proveedor> {
  // PUT completo (según tu backend)
  const resp = await httpClient.put<Proveedor>(`${BASE_URL}${id}/`, data);
  return resp.data;
}

// “Eliminar suave” = cambiar estado
export async function desactivarProveedor(id: number): Promise<void> {
  await httpClient.patch(`${BASE_URL}${id}/`, { estado: "INACTIVO" });
}


// (Opcional) reactivar
export async function activarProveedor(id: number): Promise<void> {
  await httpClient.patch(`${BASE_URL}${id}/`, { estado: "ACTIVO" });
}


export async function obtenerProveedor(id: number): Promise<Proveedor> {
  const resp = await httpClient.get<Proveedor>(`${BASE_URL}${id}/`);
  return resp.data;
}
