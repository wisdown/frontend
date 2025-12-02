import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";


function AppRouter() {
return (
<BrowserRouter>
<Routes>
{/* Rutas envueltas por el layout principal */}
<Route
path="/"
element={
<MainLayout>
<DashboardPage />
</MainLayout>
}
/>


<Route
path="/dashboard"
element={
<MainLayout>
<DashboardPage />
</MainLayout>
}
/>


{/* Rutas adicionales se irán agregando aquí (compras, inventario, etc.) */}


{/* Cualquier ruta desconocida redirige al dashboard */}
<Route path="*" element={<Navigate to="/dashboard" replace />} />
</Routes>
</BrowserRouter>
);
}


export default AppRouter;