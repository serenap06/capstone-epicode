import { NavLink } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { MENU } from "./menu";

import "./sidebar.css";

const Sidebar = () => {
  const { user } = useAuth();
  const links = MENU[user.role];

  return (
    <aside className="app-sidebar">
      <nav className="app-nav" aria-label="Sezioni">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className="app-link"
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
