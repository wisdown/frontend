// src/api/productosApi.ts
import { httpClient } from "./httpClient";

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio_compra: string; // Decimal como string
  precio_venta: string;
  activo: boolean;
}

export interface ProductoFormValues {
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio_compra: string;
  precio_venta: string;
  activo: boolean;
}

const BASE_URL = "/api/v1/productos/";

export async function listarProductos(): Promise<Producto[]> {
  const resp = await httpClient.get<Producto[]>(BASE_URL);
  return resp.data;
}

export async function crearProducto(data: ProductoFormValues): Promise<Producto> {
  const resp = await httpClient.post<Producto>(BASE_URL, data);
  return resp.data;
}

export async function actualizarProducto(id: number, data: ProductoFormValues): Promise<Producto> {
  const resp = await httpClient.put<Producto>(`${BASE_URL}${id}/`, data);
  return resp.data;
}

export async function eliminarProducto(id: number): Promise<void> {
  await httpClient.delete(`${BASE_URL}${id}/`);
}
