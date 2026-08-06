import {
  LayoutDashboard,
  Package,
  Boxes,
  TriangleAlert,
  ShieldCheck,
  ArrowLeftRight,
  Layers
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar({ menuOpen, closeMenu }) {

  const menu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard />
    },
    {
      name: "Produits",
      path: "/products",
      icon: <Package />
    },
    {
      name: "Entrée stock",
      path: "/entries",
      icon: <Boxes />
    },
    {
      name: "Sorties stock",
      path: "/outputs",
      icon: <ArrowLeftRight />
    },
    {
      name: "Alertes FEFO",
      path: "/alerts",
      icon: <TriangleAlert />,
      badge: true
    }
  ];


  const adminMenu = [
    {
      name: "Administration",
      path: "/admin",
      icon: <ShieldCheck />
    }
  ];


  const renderMenu = (items) =>
    items.map((item,index)=>(
      <NavLink
        key={index}
        to={item.path}
        onClick={closeMenu}
        className={({isActive}) =>
          isActive
          ? "sidebar-link active"
          : "sidebar-link"
        }
      >

        <span className="sidebar-icon">
          {item.icon}
        </span>

        <span className="sidebar-text">
          {item.name}
        </span>

        {item.badge && (
          <span className="alert-badge">
            !
          </span>
        )}

      </NavLink>
    ));


  return (

    <aside className={`sidebar ${menuOpen ? "open" : "closed"}`}>

      <div className="sidebar-logo">
        📦 GESTION FEFO
      </div>


      <nav>

        <div className="menu-title">
          STOCK
        </div>

        {renderMenu(menu)}


        <div className="menu-title">
          SYSTÈME
        </div>

        {renderMenu(adminMenu)}

      </nav>

    </aside>

  );

}


export default Sidebar;
