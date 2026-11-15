import { NavLink } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { MENU } from "./menu";
import "./sidebar.css";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "react-bootstrap";
import { MoreHorizontalIcon } from "lucide-react";

// menu delle sezioni: a sinistra su computer, barra in basso su telefono
const Sidebar = () => {
  const { user } = useAuth();
  // prendo le voci del ruolo dell'utente (vedi menu.js)
  const links = MENU[user.role];
  // voci che su telefono non stanno nella barra
  const hiddenLinks = links.filter((link) => link.hideOnMobile);
  // il bottone "Altro" serve solo al responsabile, che ha più voci
  const showMore = user.role === "admin" && hiddenLinks.length > 0;

  return (
    <aside className="app-sidebar">
      <nav className="app-nav" aria-label="Sezioni">
        {links.map((link) => {
          // l'icona è un componente: per usarla nel JSX il nome deve iniziare con la maiuscola
          const Icon = link.icon;
          return (
            // NavLink aggiunge da solo la classe "active" alla voce della pagina aperta
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={`app-link ${link.hideOnMobile ? "hide-mobile" : ""}`}
            >
              {Icon && <Icon className="app-link-icon" size={20}></Icon>}
              <span className="app-link-text">{link.label}</span>
            </NavLink>
          );
        })}
        {/* menu "Altro" con le voci nascoste su telefono; drop="up" lo apre verso l'alto */}
        {showMore && (
          <Dropdown drop="up" align="end" className="app-more">
            <DropdownToggle
              variant="light"
              className="app-link app-more-toggle"
              aria-label="Altre sezioni"
            >
              <MoreHorizontalIcon className="app-link-icon" size={20}/>
            </DropdownToggle>
            <DropdownMenu>
              {hiddenLinks.map((link) => (
                <DropdownItem key={link.to} as={NavLink} to={link.to}>
                  {link.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
