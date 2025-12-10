// src/api/inventarioApi.ts
import { httpClient } from "./httpClient";

export interface Existencia {
  producto_id: number;
  producto_nombre: string;   // 👈 coincide con el JSON
  bodega_id: number;
  bodega_nombre: string;     // 👈 coincide con el JSON
  cantidad: string;
}

// Si tu DRF tiene paginación, seguramente devuelve { count, results: [...] }
interface ExistenciasResponsePaginada {
  count: number;
  results: Existencia[];
}

// Versión robusta: acepta array directo o objeto con results
export async function obtenerExistencias(): Promise<Existencia[]> {
  const resp = await httpClient.get("/api/v1/inventario/existencias/");

  console.log("RESPUESTA cruda existencias:", resp.data);

  const data = resp.data;

  // Caso 1: ya es un array
  if (Array.isArray(data)) {
    return data;
  }

  // Caso 2: DRF paginado: { count, results: [...] }
  if (data && Array.isArray(data.results)) {
    return data.results;
  }

  // Otros casos: devolvemos array vacío para no romper la UI
  console.error("Formato inesperado de existencias:", data);
  return [];
}

