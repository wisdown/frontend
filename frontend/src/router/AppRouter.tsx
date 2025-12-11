import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import LoginPage from "../pages/auth/LoginPage";
import ProtectedRoute from "../components/ProtectedRoute";
import ExistenciasPage from "../pages/inventario/ExistenciasPage";
import ProductosPage from "../pages/productos/ProductosPage";
import BodegasPage from "../pages/bodegas/BodegasPage";
import ComprasPage from "../pages/compras/ComprasPage";




function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública: login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas privadas: envueltas por ProtectedRoute + MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Ruta por defecto (/) redirige a /dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Aquí luego agregamos:
              <Route path="/compras" element={<ComprasPage />} />
              <Route path="/inventario" element={<InventarioPage />} />
              etc.
          */}
          <Route path="/inventario/existencias" element={<ExistenciasPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/bodegas" element={<BodegasPage />} />
           <Route path="/compras" element={<ComprasPage />} />




        </Route>

        {/* Cualquier otra ruta redirige al dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
