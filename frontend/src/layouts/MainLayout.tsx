import Sidebar from "../components/Sidebar";
import HeaderBar from "../components/HeaderBar";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar lateral */}
      <Sidebar />

      {/* Contenedor principal (header + contenido) */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <HeaderBar />
        <main style={{ padding: "1rem" }}>
          {/* Aquí se renderizan las páginas hijas */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
