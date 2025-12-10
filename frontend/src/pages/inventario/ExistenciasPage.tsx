import { useEffect, useState } from "react";
import { obtenerExistencias, type Existencia } from "../../api/inventarioApi";

function ExistenciasPage() {
  const [data, setData] = useState<Existencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const resp = await obtenerExistencias();
        console.log("Ejemplo de item:", resp[0]);      
        setData(resp);
      } catch (err) {
        setError("No se pudieron cargar las existencias.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  if (loading) {
    return <p>Cargando existencias...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div>
      <h1>Existencias de Inventario</h1>
      <p>Listado de existencias por producto y bodega.</p>

      {data.length === 0 ? (
        <p>No hay existencias registradas.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Bodega</th>
              <th style={thStyle}>Producto</th>
              <th style={thStyle}>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={`${item.bodega_id}-${item.producto_id}-${index}`}>
                <td style={tdStyle}>{item.bodega_nombre}</td>
                <td style={tdStyle}>{item.producto_nombre}</td>
                <td style={tdStyle}>{item.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #e5e7eb",
  padding: "0.5rem",
};

const tdStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderBottom: "1px solid #f3f4f6",
};

export default ExistenciasPage;
