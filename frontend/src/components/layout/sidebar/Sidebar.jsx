import { NavLink, useLocation } from "react-router-dom";
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

// menu delle sezioni: a sinistra su computer, in basso su telefono e tablet
const Sidebar = () => {
  const { user } = useAuth();
  // l'indirizzo della pagina aperta
  const location = useLocation();
  // le voci del ruolo (menu.js)
  const links = MENU[user.role];
  // voci che su telefono vanno in "Altro" (le desktopOnly no: su telefono non ci sono)
  const hiddenLinks = links.filter((link) => link.hideOnMobile);
  // "Altro" solo se ha delle voci
  const showMore = hiddenLinks.length > 0;
  // "Altro" evidenziato quando la pagina aperta è una delle sue voci
  const isMoreActive = hiddenLinks.some((link) =>
    location.pathname.startsWith(link.to),
  );

  return (
    <aside className="app-sidebar">
      <nav className="app-nav" aria-label="Sezioni">
        {links.map((link) => {
          // l'icona è un componente: il nome deve iniziare con la maiuscola
          const Icon = link.icon;
          return (
            // NavLink mette da solo la classe "active" sulla pagina aperta.
            // hide-mobile: sotto i 1024px va in "Altro"; hide-phone: sparisce solo su telefono
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={`app-link ${link.hideOnMobile ? "hide-mobile" : ""} ${link.desktopOnly ? "hide-phone" : ""}`}
            >
              {Icon && <Icon className="app-link-icon" size={20} />}
              <span className="app-link-text">{link.label}</span>
            </NavLink>
          );
        })}
        {/* "Altro" con le voci nascoste su telefono; drop="up": si apre verso l'alto */}
        {showMore && (
          <Dropdown drop="up" align="end" className="app-more">
            <DropdownToggle
              variant="light"
              className={`app-link app-more-toggle ${isMoreActive ? "active" : ""}`}
              aria-label="Altre sezioni"
            >
              <MoreHorizontalIcon className="app-link-icon" size={20} />
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
