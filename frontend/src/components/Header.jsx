function Header({ toggleMenu, alertes }) {
  return (
    <header className="header" style={{ display: "flex", alignItems: "center", padding: "0 15px", background: "#121212" }}>
      <button className="menu-button" onClick={toggleMenu} style={{ background: "transparent", border: "none", color: "white", fontSize: "20px", cursor: "pointer" }}>
        ☰
      </button>
<span style={{ color: "#ffffff", fontSize: "15px", fontWeight: "700", fontFamily: "system-ui, -apple-system, sans-serif", letterSpacing: "0.5px", margin: "0 auto", transform: "translateX(-15px)" }}>



        Centre de contrôle intelligent des stocks
      </span>
<div
  style={{
    marginLeft: "auto",
    color: alertes > 0 ? "#ff0044" : "#00ff88",
    fontSize: "20px",
    fontWeight: "bold",
    cursor: "pointer",
    animation: alertes > 0 ? "sonnette 1s infinite" : "none"
  }}
>
  🔔 {alertes}
</div>

    </header>
  );
}

export default Header;
