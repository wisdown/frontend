// src/pages/compras/ComprasPage.tsx
// Página para registrar Compras / Ingresos a Bodega (cabecera + detalle dinámico)

import type React from "react";
import { useEffect, useState } from "react";

import {
  crearCompra,
  type CompraCreatePayload,
  type CompraItemIn,
} from "../../api/comprasApi";
import { listarBodegas, type Bodega } from "../../api/bodegasApi";
import { listarProveedores, type Proveedor } from "../../api/proveedoresApi";
import { listarProductos, type Producto } from "../../api/productosApi";

// ---------------------------------------------------------------------------
// Tipos auxiliares para el formulario
// ---------------------------------------------------------------------------

interface CompraCabeceraForm {
  proveedor_id: number | "";
  bodega_id: number | "";
  fecha: string; // "YYYY-MM-DD"
  no_documento: string;
  observaciones: string;
}

interface CompraItemForm {
  producto_id: number | "";
  cantidad: string;       // se maneja como string en el input
  costo_unitario: string; // idem
}

// ---------------------------------------------------------------------------
// Constantes de formulario inicial
// ---------------------------------------------------------------------------

const emptyCabecera: CompraCabeceraForm = {
  proveedor_id: "",
  bodega_id: "",
  fecha: new Date().toISOString().slice(0, 10),
  no_documento: "",
  observaciones: "",
};

const emptyItem: CompraItemForm = {
  producto_id: "",
  cantidad: "",
  costo_unitario: "",
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

function ComprasPage() {
  const [cabecera, setCabecera] = useState<CompraCabeceraForm>(emptyCabecera);
  const [items, setItems] = useState<CompraItemForm[]>([emptyItem]);

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  const [loadingInit, setLoadingInit] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Cargar catálogos iniciales
  // -------------------------------------------------------------------------
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        setLoadingInit(true);
        const [respProv, respBod, respProd] = await Promise.all([
          listarProveedores(),
          listarBodegas(),
          listarProductos(),
        ]);

        setProveedores(respProv);
        setBodegas(respBod);
        setProductos(respProd);
      } catch (err) {
        console.error(err);
        setError(
          "No se pudieron cargar los catálogos de proveedores, bodegas y productos."
        );
      } finally {
        setLoadingInit(false);
      }
    };

    cargarCatalogos();
  }, []);

  // -------------------------------------------------------------------------
  // Handlers cabecera
  //console.log("Payload enviado:", data);

  // -------------------------------------------------------------------------
  const handleCabeceraChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setCabecera((prev) => ({
      ...prev,
      [name]:
        name === "proveedor_id" || name === "bodega_id"
          ? value
            ? Number(value)
            : ""
          : value,
    }));
  };

  // -------------------------------------------------------------------------
  // Handlers items
  // -------------------------------------------------------------------------
  const handleItemChange = (
    index: number,
    field: keyof CompraItemForm,
    value: string
  ) => {
    setItems((prev) => {
      const copia = [...prev];
      copia[index] = {
        ...copia[index],
        [field]: field === "producto_id" ? (value ? Number(value) : "") : value,
      };
      return copia;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { ...emptyItem }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // -------------------------------------------------------------------------
  // Cálculos de totales (solo visual)
  // -------------------------------------------------------------------------
  const calcularSubtotal = (item: CompraItemForm): number => {
    const cantidad = Number(item.cantidad.replace(",", "."));
    const costo = Number(item.costo_unitario.replace(",", "."));
    if (isNaN(cantidad) || isNaN(costo)) return 0;
    return cantidad * costo;
  };

  const totalCalculado = items.reduce(
    (acc, it) => acc + calcularSubtotal(it),
    0
  );

  // -------------------------------------------------------------------------
  // Validaciones simples antes de enviar
  // -------------------------------------------------------------------------
  const validarFormulario = (): string | null => {
    if (!cabecera.proveedor_id) return "Debe seleccionar un proveedor.";
    if (!cabecera.bodega_id) return "Debe seleccionar una bodega destino.";
    if (!cabecera.no_documento.trim())
      return "Debe ingresar el número de documento.";

    if (items.length === 0)
      return "Debe ingresar al menos un producto en el detalle.";

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.producto_id)
        return `Seleccione un producto en la fila ${i + 1}.`;

      const cantidad = Number(it.cantidad.replace(",", "."));
      const costo = Number(it.costo_unitario.replace(",", "."));

      if (isNaN(cantidad) || cantidad <= 0) {
        return `La cantidad en la fila ${i + 1} debe ser un número mayor a 0.`;
      }
      if (isNaN(costo) || costo < 0) {
        return `El costo unitario en la fila ${i + 1} debe ser un número mayor o igual a 0.`;
      }
    }

    return null;
  };

  // -------------------------------------------------------------------------
  // Submit: crear compra
  // -------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setError(errorValidacion);
      alert(errorValidacion);
      return;
    }

    const payload: CompraCreatePayload = {
    proveedor_id: cabecera.proveedor_id as number,
    bodega_id: cabecera.bodega_id as number,
    no_documento: cabecera.no_documento.trim(),
    observaciones: cabecera.observaciones.trim() || undefined,
    items: items.map<CompraItemIn>((it) => ({
        producto_id: it.producto_id as number,
        // enviamos strings, igual que en Postman: "5.0", "15.75"
        cantidad: it.cantidad.replace(",", ".").trim(),
        costo_unit: it.costo_unitario.replace(",", ".").trim(),
    })),
    };
    console.log("Payload que se enviará a /compras/:", payload);

    try {
      setSaving(true);
      const compraCreada = await crearCompra(payload);
      console.log("Compra creada:", compraCreada); 


      setSuccessMessage(
        `Compra #${compraCreada.id} registrada correctamente. Total: Q${compraCreada.total}`
      );
      alert(
        `Compra registrada correctamente. Total: Q${compraCreada.total}`
      );

      // Resetear formulario a estado inicial
      setCabecera(emptyCabecera);
      setItems([emptyItem]);
    } catch (err: any) {
      console.error(err);
      const data = err?.response?.data;
      let mensaje: string | null = null;

      if (data) {
        if (typeof data.detail === "string") {
          mensaje = data.detail;
        } else if (typeof data === "string") {
          mensaje = data;
        }
      }

      setError(
        mensaje ||
          "No se pudo registrar la compra. Revise los datos e intente de nuevo."
      );
      alert(
        mensaje ||
          "No se pudo registrar la compra. Revise los datos e intente de nuevo."
      );
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  if (loadingInit) {
    return <p>Cargando catálogos de proveedores, bodegas y productos...</p>;
  }

  return (
    <div>
      <h1>Compras / Ingreso a Bodega</h1>
      <p>Registrar compras a proveedores y su ingreso a una bodega específica.</p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        {/* Cabecera */}
        <section
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            padding: "1rem",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Datos de la compra</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "0.75rem",
            }}
          >
            <div>
              <label>
                Proveedor
                <select
                  name="proveedor_id"
                  value={cabecera.proveedor_id ?? ""}
                  onChange={handleCabeceraChange}
                  required
                  style={inputStyle}
                >
                  <option value="">Seleccione proveedor</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label>
                Bodega destino
                <select
                  name="bodega_id"
                  value={cabecera.bodega_id ?? ""}
                  onChange={handleCabeceraChange}
                  required
                  style={inputStyle}
                >
                  <option value="">Seleccione bodega</option>
                  {bodegas.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label>
                Fecha
                <input
                  type="date"
                  name="fecha"
                  value={cabecera.fecha}
                  onChange={handleCabeceraChange}
                  required
                  style={inputStyle}
                />
              </label>
            </div>

            <div>
              <label>
                No. Documento
                <input
                  type="text"
                  name="no_documento"
                  value={cabecera.no_documento}
                  onChange={handleCabeceraChange}
                  required
                  style={inputStyle}
                />
              </label>
            </div>
          </div>

          <div style={{ marginTop: "0.75rem" }}>
            <label>
              Observaciones
              <textarea
                name="observaciones"
                value={cabecera.observaciones}
                onChange={handleCabeceraChange}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </label>
          </div>
        </section>

        {/* Detalle */}
        <section
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            padding: "1rem",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Detalle de productos</h2>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Producto</th>
                <th style={thStyle}>Cantidad</th>
                <th style={thStyle}>Costo unitario</th>
                <th style={thStyle}>Subtotal</th>
                <th style={thStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td style={tdStyle}>
                    <select
                      value={item.producto_id ?? ""}
                      onChange={(e) =>
                        handleItemChange(index, "producto_id", e.target.value)
                      }
                      required
                      style={inputStyle}
                    >
                      <option value="">Seleccione producto</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.cantidad}
                      onChange={(e) =>
                        handleItemChange(index, "cantidad", e.target.value)
                      }
                      required
                      style={inputStyle}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.costo_unitario}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "costo_unitario",
                          e.target.value
                        )
                      }
                      required
                      style={inputStyle}
                    />
                  </td>
                  <td style={tdStyle}>
                    Q {calcularSubtotal(item).toFixed(2)}
                  </td>
                  <td style={tdStyle}>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length === 1}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "0.75rem" }}>
            <button type="button" onClick={handleAddItem}>
              + Agregar producto
            </button>
          </div>

          <div
            style={{
              marginTop: "1rem",
              textAlign: "right",
              fontWeight: 600,
            }}
          >
            Total calculado: Q {totalCalculado.toFixed(2)}
          </div>
        </section>

        {/* Botones de acción */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="submit" disabled={saving}>
            {saving ? "Guardando compra..." : "Guardar compra"}
          </button>

          <button
            type="button"
            onClick={() => {
              setCabecera(emptyCabecera);
              setItems([emptyItem]);
              setError(null);
              setSuccessMessage(null);
            }}
          >
            Limpiar formulario
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.4rem 0.5rem",
  marginTop: "0.25rem",
  borderRadius: "0.375rem",
  border: "1px solid #d1d5db",
  boxSizing: "border-box",
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

export default ComprasPage;
