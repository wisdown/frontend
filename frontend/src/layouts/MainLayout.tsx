import { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import HeaderBar from "../components/HeaderBar";


interface MainLayoutProps {
children: ReactNode;
}


function MainLayout({ children }: MainLayoutProps) {
return (
<div style={{ display: "flex", minHeight: "100vh" }}>
{/* Sidebar lateral */}
<Sidebar />


{/* Contenedor principal (header + contenido) */}
<div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
<HeaderBar />
<main style={{ padding: "1rem" }}>{children}</main>
</div>
</div>
);
}


export default MainLayout;