function HeaderBar() {
return (
<header
style={{
height: "56px",
borderBottom: "1px solid #e5e7eb",
display: "flex",
alignItems: "center",
justifyContent: "space-between",
padding: "0 1rem",
backgroundColor: "white",
position: "sticky",
top: 0,
zIndex: 10,
}}
>
<div style={{ fontWeight: "500" }}>Panel principal</div>
<div style={{ fontSize: "0.9rem", color: "#6b7280" }}>Usuario: (pendiente auth)</div>
</header>
);
}


export default HeaderBar;