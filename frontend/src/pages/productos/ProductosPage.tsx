// src/pages/productos/ProductosPage.tsx
import { useEffect, useState } from "react";
import {type FormEvent } from "react"
import {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  type Producto,
  type ProductoFormValues,
} from "../../api/productosApi";

const emptyForm: ProductoFormValues = {
  sku: "",
  nombre: "",
  modelo: "",
  costo_ref: "0.00",
  precio_base: "0.00",
  activo: true,
};

function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<ProductoFormValues>(emptyForm);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Cargar listado inicial
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = await listarProductos();
        setProductos(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los productos.");
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingProducto) {
        const updated = await actualizarProducto(editingProducto.id, formValues);
        setProductos((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
      } else {
        const created = await crearProducto(formValues);
        setProductos((prev) => [created, ...prev]);
      }

      setFormValues(emptyForm);
      setEditingProducto(null);
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setFormValues({
      sku: producto.sku ?? "",
      nombre: producto.nombre ?? "",
      modelo: producto.modelo ?? "",
      costo_ref: producto.costo_ref ?? "0.00",
      precio_base: producto.precio_base ?? "0.00",
      activo: producto.activo,
    });
  };

  const handleCancelEdit = () => {
    setEditingProducto(null);
    setFormValues(emptyForm);
  };


const handleDelete = async (producto: Producto) => {
  const ok = window.confirm(
    `¿Desactivar el producto "${producto.nombre}"?`
  );
  if (!ok) return;

  try {
    setDeletingId(producto.id);
    await eliminarProducto(producto.id);

    // OJO: si el backend hace soft-delete (activo = false)
    // y NO elimina el registro, aquí puedes:
    // - refrescar la lista desde el servidor, o
    // - actualizar solo el campo activo.
    //
    // Por ahora, supongamos que lo quieres sacar de la vista:
    setProductos((prev) => prev.filter((p) => p.id !== producto.id));
  } catch (err: any) {
    // NO usamos console.error para no llenar la consola.
    const detailFromBackend: string | undefined =
      err?.response?.data?.detail;

    const mensaje =
      detailFromBackend ??
      "No se pudo desactivar el producto. Intente nuevamente.";

    alert(mensaje);     // mensaje amigable al usuario
    setError(mensaje);  // opcional: mostrarlo arriba de la tabla
  } finally {
    setDeletingId(null);
  }
};


  if (loading) {
    return <p>Cargando productos...</p>;
  }

  return (
    <div>
      <h1>Productos</h1>
      <p>Gestión básica de productos (listar, crear, editar y eliminar).</p>

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
          {editingProducto ? "Editar producto" : "Nuevo producto"}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
          <div>
            <label>
              Código (SKU)
              <input
                type="text"
                name="sku"
                value={formValues.sku}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </label>
          </div>

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
              Modelo
              <input
                type="text"
                name="modelo"
                value={formValues.modelo}
                onChange={handleChange}
                style={inputStyle}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <label style={{ flex: 1 }}>
              Precio compra (costo_ref)
              <input
                type="number"
                step="0.01"
                name="costo_ref"
                value={formValues.costo_ref}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </label>

            <label style={{ flex: 1 }}>
              Precio venta (precio_base)
              <input
                type="number"
                step="0.01"
                name="precio_base"
                value={formValues.precio_base}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </label>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              name="activo"
              checked={formValues.activo}
              onChange={handleChange}
            />
            Activo
          </label>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="submit" disabled={saving}>
              {saving
                ? "Guardando..."
                : editingProducto
                ? "Actualizar"
                : "Crear"}
            </button>

            {editingProducto && (
              <button type="button" onClick={handleCancelEdit}>
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Tabla */}
      {productos.length === 0 ? (
        <p>No hay productos registrados.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Código (SKU)</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Modelo</th>
              <th style={thStyle}>Costo ref</th>
              <th style={thStyle}>Precio base</th>
              <th style={thStyle}>Activo</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td style={tdStyle}>{p.sku}</td>
                <td style={tdStyle}>{p.nombre}</td>
                <td style={tdStyle}>{p.modelo}</td>
                <td style={tdStyle}>{p.costo_ref}</td>
                <td style={tdStyle}>{p.precio_base}</td>
                <td style={tdStyle}>{p.activo ? "Sí" : "No"}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleEdit(p)}
                    style={{ marginRight: "0.5rem" }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    disabled={deletingId === p.id}
                  >
                    {deletingId === p.id ? "Desactivar..." : "Desactivar"}
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

export default ProductosPage;
