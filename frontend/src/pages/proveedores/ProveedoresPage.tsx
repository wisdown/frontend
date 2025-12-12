// src/pages/proveedores/ProveedoresPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  listarProveedores,
  crearProveedor,
  actualizarProveedor,
  desactivarProveedor,
  type Proveedor,
  type ProveedorFormValues,
  obtenerProveedor,
} from "../../api/proveedoresApi";

const emptyForm: ProveedorFormValues = {
  nombre: "",
  nit: "",
  cui: "",
  direccion: "",
  telefono: "",
  email: "",
  estado: "ACTIVO",
};

export default function ProveedoresPage() {
  const [items, setItems] = useState<Proveedor[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<ProveedorFormValues>(emptyForm);

  const isEditing = selectedId !== null;

  const cargar = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarProveedores({ search: search || undefined, page });
      setItems(data.results);
      setCount(data.count);
      setNext(data.next);
      setPrevious(data.previous);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los proveedores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    await cargar();
  };

  const resetForm = () => {
    setSelectedId(null);
    setForm(emptyForm);
  };

    const onSelectRow = async (p: Proveedor) => {
    try {
        setError(null);
        setSelectedId(p.id);

        const full = await obtenerProveedor(p.id);

        setForm({
        nombre: full.nombre ?? "",
        nit: full.nit ?? "",
        cui: full.cui ?? "",
        direccion: full.direccion ?? "",
        telefono: full.telefono ?? "",
        email: full.email ?? "",
        estado: (full.estado ?? "ACTIVO") as any,
        });
    } catch (e) {
        console.error(e);
        setError("No se pudo cargar el detalle del proveedor.");
    }
    };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.nombre?.trim()) {
      setError("El nombre del proveedor es obligatorio.");
      return;
    }

    try {
      setSaving(true);
      if (isEditing && selectedId) {
        await actualizarProveedor(selectedId, {
          ...form,
          nombre: form.nombre.trim(),
          nit: form.nit?.trim() || undefined,
          telefono: form.telefono?.trim() || undefined,
          direccion: form.direccion?.trim() || undefined,
          email: form.email?.trim() || undefined,
        });
      } else {
        await crearProveedor({
          ...form,
          nombre: form.nombre.trim(),
          nit: form.nit?.trim() || undefined,
          telefono: form.telefono?.trim() || undefined,
          direccion: form.direccion?.trim() || undefined,
          email: form.email?.trim() || undefined,
        });
      }

      await cargar();
      resetForm();
    } catch (err: any) {
      console.error(err);
      const data = err?.response?.data;

      // Mensaje legible (DRF)
      let msg: string | null = null;
      if (data?.detail) msg = String(data.detail);
      else if (data && typeof data === "object") {
        msg = Object.entries(data)
          .map(([k, v]) => (Array.isArray(v) ? `${k}: ${v.join(", ")}` : `${k}: ${String(v)}`))
          .join(" | ");
      }

      setError(msg || "No se pudo guardar el proveedor (validación backend).");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("¿Deseas desactivar este proveedor?")) return;

    try {
      setError(null);
      await desactivarProveedor(id);
      await cargar();
      if (selectedId === id) resetForm();
    } catch (err: any) {
      console.error(err);
      const data = err?.response?.data;
      const msg = data?.detail ? String(data.detail) : "No se pudo desactivar el proveedor.";
      setError(msg);
      /* const data = err?.response?.data; */
        console.log("Error backend desactivar proveedor:", data);
      
    }
  };

  const footer = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(count / 10)); // si tu backend usa otro page_size, lo ajustamos
    return { totalPages };
  }, [count]);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <h1>Proveedores</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o NIT…"
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button type="submit" disabled={loading}>
          Buscar
        </button>
        <button type="button" onClick={() => { setSearch(""); setPage(1); resetForm(); cargar(); }}>
          Limpiar
        </button>
      </form>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1rem" }}>
        {/* Tabla */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
          <h2 style={{ marginTop: 0 }}>Listado</h2>
          {loading ? (
            <p>Cargando…</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>ID</th>
                  <th style={th}>Nombre</th>
                  <th style={th}>NIT</th>
                  <th style={th}>Estado</th>
                  <th style={th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => onSelectRow(p)}
                    style={{
                      cursor: "pointer",
                      background: selectedId === p.id ? "#f3f4f6" : "transparent",
                    }}
                  >
                    <td style={td}>{p.id}</td>
                    <td style={td}>{p.nombre}</td>
                    <td style={td}>{p.nit ?? "-"}</td>
                    <td style={td}>{p.estado ?? "-"}</td>
                    <td style={td}>
                      <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}>
                        Desactivar
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td style={td} colSpan={5}>
                      Sin resultados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          <div style={{ display: "flex", gap: "0.5rem", marginTop: 10 }}>
            <button type="button" disabled={!previous || loading || page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Anterior
            </button>
            <span style={{ alignSelf: "center" }}>
              Página {page} / {footer.totalPages} — Total: {count}
            </span>
            <button type="button" disabled={!next || loading} onClick={() => setPage((p) => p + 1)}>
              Siguiente
            </button>
          </div>
        </div>

        {/* Formulario */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
          <h2 style={{ marginTop: 0 }}>{isEditing ? `Editar proveedor #${selectedId}` : "Crear proveedor"}</h2>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.5rem" }}>
            <label>
              Nombre *
              <input
                value={form.nombre}
                onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
                style={input}
              />
            </label>
            <label>
            CUI
            <input
                value={form.cui ?? ""}
                onChange={(e) => setForm((s) => ({ ...s, cui: e.target.value }))}
                style={input}
            />
            </label>
            

            <label>
              NIT
              <input
                value={form.nit ?? ""}
                onChange={(e) => setForm((s) => ({ ...s, nit: e.target.value }))}
                style={input}
              />
            </label>

            <label>
              Teléfono
              <input
                value={form.telefono ?? ""}
                onChange={(e) => setForm((s) => ({ ...s, telefono: e.target.value }))}
                style={input}
              />
            </label>

            <label>
              Dirección
              <input
                value={form.direccion ?? ""}
                onChange={(e) => setForm((s) => ({ ...s, direccion: e.target.value }))}
                style={input}
              />
            </label>

            <label>
              Email
              <input
                value={form.email ?? ""}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                style={input}
              />
            </label>

            <label>
            Estado
            <select
                value={form.estado ?? "ACTIVO"}
                onChange={(e) => setForm((s) => ({ ...s, estado: e.target.value as any }))}
                style={input}
            >
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
            </select>
            </label>            

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit" disabled={saving}>
                {saving ? "Guardando…" : isEditing ? "Actualizar" : "Crear"}
              </button>
              <button type="button" onClick={resetForm}>
                Nuevo
              </button>
              <button type="button" onClick={cargar} disabled={loading}>
                Refrescar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" };
const td: React.CSSProperties = { padding: 8, borderBottom: "1px solid #f3f4f6" };
const input: React.CSSProperties = { width: "100%", padding: "0.5rem", marginTop: 4, border: "1px solid #d1d5db", borderRadius: 6 };
