// src/pages/bodegas/BodegasPage.tsx
import { useEffect, useState } from "react";
import type React from "react";
import {
  listarBodegas,
  crearBodega,
  actualizarBodega,
  desactivarBodega,
  type Bodega,
  type BodegaFormValues,
} from "../../api/bodegasApi";

const emptyForm: BodegaFormValues = {
  nombre: "",
  ubicacion: "",
  activo: true,
};

function BodegasPage() {
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<BodegaFormValues>(emptyForm);
  const [editingBodega, setEditingBodega] = useState<Bodega | null>(null);
  const [saving, setSaving] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);

  // Cargar listado inicial
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = await listarBodegas();
        setBodegas(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las bodegas.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingBodega) {
        const updated = await actualizarBodega(editingBodega.id, formValues);
        setBodegas((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b))
        );
      } else {
        const created = await crearBodega(formValues);
        setBodegas((prev) => [created, ...prev]);
      }

      setFormValues(emptyForm);
      setEditingBodega(null);
    } catch (err: any) {
      console.error(err);

      // Intentar extraer mensaje útil del backend
      const data = err?.response?.data;
      let mensaje =
        data?.detail ??
        (Array.isArray(data?.nombre) ? data.nombre[0] : null) ??
        "No se pudo guardar la bodega.";

      setError(mensaje);
      alert(mensaje);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (bodega: Bodega) => {
    setEditingBodega(bodega);
    setFormValues({
      nombre: bodega.nombre ?? "",
      ubicacion: bodega.ubicacion ?? "",
      activo: bodega.activo,
    });
  };

  const handleCancelEdit = () => {
    setEditingBodega(null);
    setFormValues(emptyForm);
  };


  const handleDesactivar = async (bodega: Bodega) => {
  const ok = window.confirm(
    `¿Desactivar la bodega "${bodega.nombre}"?`
  );
  if (!ok) return;

  try {
    setDeactivatingId(bodega.id);

    // 1) Llamamos al backend para desactivar
    await desactivarBodega(bodega.id);

    // 2) Re-cargamos el listado desde la API para reflejar el cambio
    const dataActualizada = await listarBodegas();
    setBodegas(dataActualizada);

  } catch (err: any) {
    console.error(err);

    const data = err?.response?.data;
    const mensaje =
      data?.detail ??
      "No se pudo desactivar la bodega. Revise si tiene relaciones (existencias, movimientos, etc.).";

    setError(mensaje);
    alert(mensaje);
  } finally {
    setDeactivatingId(null);
  }
};


/*   const handleDesactivar = async (bodega: Bodega) => {
    const ok = window.confirm(
      `¿Desactivar la bodega "${bodega.nombre}"?`
    );
    if (!ok) return;

    try {
      setDeactivatingId(bodega.id);
      await desactivarBodega(bodega.id);

      // Para MVP, la quitamos de la tabla.
      // Más adelante podríamos solo marcar activo=false y mostrar un filtro.
      setBodegas((prev) => prev.filter((b) => b.id !== bodega.id));
    } catch (err: any) {
      console.error(err);

      const data = err?.response?.data;
      const mensaje =
        data?.detail ??
        "No se pudo desactivar la bodega. Revise si tiene relaciones (existencias, movimientos, etc.).";

      setError(mensaje);
      alert(mensaje);
    } finally {
      setDeactivatingId(null);
    }
  }; */

  if (loading) {
    return <p>Cargando bodegas...</p>;
  }

  return (
    <div>
      <h1>Bodegas</h1>
      <p>Gestión de bodegas (listar, crear, editar, desactivar).</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Formulario */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          {editingBodega ? "Editar bodega" : "Nueva bodega"}
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: "0.75rem", maxWidth: "480px" }}
        >
          <div>
            <label>
              Nombre
              <input
                type="text"
                name="nombre"
                value={formValues.nombre}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </label>
          </div>

          <div>
            <label>
              Ubicación
              <input
                type="text"
                name="ubicacion"
                value={formValues.ubicacion}
                onChange={handleChange}
                style={inputStyle}
              />
            </label>
          </div>

          <label
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <input
              type="checkbox"
              name="activo"
              checked={formValues.activo}
              onChange={handleChange}
            />
            Activa
          </label>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="submit" disabled={saving}>
              {saving
                ? "Guardando..."
                : editingBodega
                ? "Actualizar"
                : "Crear"}
            </button>

            {editingBodega && (
              <button type="button" onClick={handleCancelEdit}>
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Tabla */}
      {bodegas.length === 0 ? (
        <p>No hay bodegas registradas.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Ubicación</th>
              <th style={thStyle}>Activa</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {bodegas.map((b) => (
              <tr key={b.id}>
                <td style={tdStyle}>{b.id}</td>
                <td style={tdStyle}>{b.nombre}</td>
                <td style={tdStyle}>{b.ubicacion}</td>
                <td style={tdStyle}>{b.activo ? "Sí" : "No"}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleEdit(b)}
                    style={{ marginRight: "0.5rem" }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDesactivar(b)}
                    disabled={deactivatingId === b.id}
                  >
                    {deactivatingId === b.id
                      ? "Desactivando..."
                      : "Desactivar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.4rem 0.5rem",
  marginTop: "0.25rem",
  borderRadius: "0.375rem",
  border: "1px solid #d1d5db",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #e5e7eb",
  padding: "0.5rem",
  fontWeight: 500,
};

const tdStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderBottom: "1px solid #f3f4f6",
  fontSize: "0.95rem",
};

export default BodegasPage;
