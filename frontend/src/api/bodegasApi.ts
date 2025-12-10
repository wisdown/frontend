// src/api/bodegasApi.ts
import { httpClient } from "./httpClient";

export interface Bodega {
  id: number;
  nombre: string;
  ubicacion: string | null;
  activo: boolean;
}

export interface BodegaFormValues {
  nombre: string;
  ubicacion: string;
  activo: boolean;
}

const BASE_URL = "/api/v1/catalogos/bodegas/";

export async function listarBodegas(): Promise<Bodega[]> {
  const resp = await httpClient.get<Bodega[]>(BASE_URL);
  return resp.data;
}

export async function crearBodega(data: BodegaFormValues): Promise<Bodega> {
  const resp = await httpClient.post<Bodega>(BASE_URL, data);
  return resp.data;
}

export async function actualizarBodega(
  id: number,
  data: BodegaFormValues
): Promise<Bodega> {
  const resp = await httpClient.put<Bodega>(`${BASE_URL}${id}/`, data);
  return resp.data;
}

export async function desactivarBodega(id: number): Promise<void> {
  await httpClient.delete(`${BASE_URL}${id}/`);
}
