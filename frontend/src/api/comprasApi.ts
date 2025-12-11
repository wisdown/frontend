// src/api/comprasApi.ts
// Capa de acceso a la API para el módulo Compras / Ingreso a Bodega

import { httpClient } from "./httpClient";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type EstadoCompra = "REGISTRADA" | "ANULADA" | "CERRADA";

// Payload que envía el frontend al crear una compra
export interface CompraItemIn {
  producto_id: number;
  cantidad: string;   // el backend recibe "5.0"
  costo_unit: string; // el backend recibe "15.75"
}

export interface CompraCreatePayload {
  proveedor_id: number;
  bodega_id: number;
  no_documento: string;
  observaciones?: string;
  items: CompraItemIn[];
}

// Resumen para listados (historial de compras)
export interface CompraListItem {
  id: number;
  no_documento: string;
  proveedor_id?: number;
  proveedor_nombre: string;
  bodega_id?: number;
  bodega_nombre: string;
  fecha: string;  // string de fecha que viene del backend
  total: string;  // Decimal representado como string
  estado: EstadoCompra;
}

// Detalle de la compra (incluye items)
export interface CompraDetalleItem {
  producto_id: number;
  producto_nombre: string;
  cantidad: string;        // viene como Decimal en string
  costo_unitario: string;
  subtotal: string;
}

export interface Compra {
  id: number;
  proveedor_id: number;
  proveedor_nombre: string;
  bodega_id: number;
  bodega_nombre: string;
  fecha: string;
  no_documento: string;
  total: string;
  estado: EstadoCompra;
  observaciones?: string | null;
  items: CompraDetalleItem[];
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const BASE_URL = "/api/v1/compras/";

// ---------------------------------------------------------------------------
// Funciones API
// ---------------------------------------------------------------------------

/**
 * Lista compras (historial). Versión MVP: sin paginación.
 */
export async function listarCompras(): Promise<CompraListItem[]> {
  const resp = await httpClient.get<CompraListItem[]>(BASE_URL);
  return resp.data;
}

/**
 * Obtiene el detalle completo de una compra.
 */
export async function obtenerCompra(id: number): Promise<Compra> {
  const resp = await httpClient.get<Compra>(`${BASE_URL}${id}/`);
  return resp.data;
}

/**
 * Crea una compra (cabecera + detalle). El backend es responsable de:
 * - Validar proveedor, bodega y productos.
 * - Calcular subtotales y total.
 * - Registrar movimientos de inventario y actualizar existencias.
 */
export async function crearCompra(
  payload: CompraCreatePayload
): Promise<Compra> {
  const resp = await httpClient.post<Compra>(BASE_URL, payload);
  return resp.data;
}

// En versiones futuras podríamos agregar:
// - actualizarCompra(id, payloadParcial)
// - anularCompra(id)
