// src/api/proveedoresApi.ts
// Capa de acceso a la API para el módulo de Proveedores (CRUD básico)

import { httpClient } from "./httpClient";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface Proveedor {
  id: number;
  nombre: string;
  nit?: string | null;
  estado?: string | null;      // lo agregamos porque viene en el JSON
  telefono?: string | null;
  direccion?: string | null;
  email?: string | null;
  activo?: boolean;            // opcional, por si más adelante lo manejas así
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
  telefono?: string;
  direccion?: string;
  email?: string;
  activo?: boolean;
}

// Ruta real según tu backend:
const BASE_URL = "/api/v1/catalogos/proveedores/";

// ---------------------------------------------------------------------------
// Funciones API
// ---------------------------------------------------------------------------

/**
 * Lista proveedores. Versión actual: backend devuelve un objeto paginado,
 * así que aquí devolvemos sólo `results` al frontend.
 */
export async function listarProveedores(): Promise<Proveedor[]> {
  const resp = await httpClient.get<ProveedoresPaginadosResponse>(BASE_URL);
  return resp.data.results;   // ⬅️ AQUÍ ESTÁ LA CLAVE
}

/**
 * Crea un proveedor.
 */
export async function crearProveedor(
  data: ProveedorFormValues
): Promise<Proveedor> {
  const resp = await httpClient.post<Proveedor>(BASE_URL, data);
  return resp.data;
}

/**
 * Actualiza un proveedor existente.
 */
export async function actualizarProveedor(
  id: number,
  data: ProveedorFormValues
): Promise<Proveedor> {
  const resp = await httpClient.put<Proveedor>(`${BASE_URL}${id}/`, data);
  return resp.data;
}

/**
 * Desactiva o elimina un proveedor (según implemente tu backend).
 */
export async function desactivarProveedor(id: number): Promise<void> {
  await httpClient.delete(`${BASE_URL}${id}/`);
}
