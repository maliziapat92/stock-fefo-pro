import { useState } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";
import FooterStatus from "./FooterStatus";

function Layout({ children, alertes = 0 }) {

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">

<Header 
  toggleMenu={() => setMenuOpen(!menuOpen)}
  alertes={alertes}
/>

      <div className="app-body">

        <Sidebar
          menuOpen={menuOpen}
          closeMenu={() => setMenuOpen(false)}
        />

        <main
          className="page-content"
          onClick={() => setMenuOpen(false)}
        >
          {children}
        </main>

      </div>

      <FooterStatus />

    </div>
  );
}

export default Layout;
