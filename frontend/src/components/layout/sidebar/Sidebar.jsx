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

const Sidebar = () => {
  const { user } = useAuth();
  const links = MENU[user.role];
  const hiddenLinks = links.filter((link) => link.hideOnMobile);
  const showMore = user.role === "admin" && hiddenLinks.length > 0;

  return (
    <aside className="app-sidebar">
      <nav className="app-nav" aria-label="Sezioni">
        {links.map((link) => {
          const Icon = link.icon;
          return (
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
