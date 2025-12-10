import { Link } from "react-router-dom";


function Sidebar() {
return (
<aside
style={{
width: "220px",
backgroundColor: "#1e293b", // gris azulado oscuro
color: "white",
padding: "1rem",
display: "flex",
flexDirection: "column",
gap: "0.5rem",
}}
>
<div style={{ marginBottom: "1rem", fontWeight: "bold", fontSize: "1.1rem" }}>
ERP LomaLinda
</div>


<nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
<Link style={linkStyle} to="/dashboard">
Dashboard
</Link>
<Link style={linkStyle} to="/compras">
Compras
</Link>
<Link style={linkStyle} to="/inventario/existencias">
Inventario / Existencias
</Link>
<Link style={linkStyle} to="/productos">
  Productos
</Link>
<Link style={linkStyle} to="/bodegas">
  Bodegas
</Link>
<Link style={linkStyle} to="/clientes">
Clientes
</Link>
<Link style={linkStyle} to="/pagos">
Pagos
</Link>
</nav>
</aside>
);
}


const linkStyle: React.CSSProperties = {
color: "#e5e7eb",
textDecoration: "none",
padding: "0.35rem 0.5rem",
borderRadius: "0.25rem",
};


export default Sidebar;