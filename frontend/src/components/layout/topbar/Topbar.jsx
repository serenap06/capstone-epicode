import { Dropdown, DropdownItem, DropdownMenu } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { formatFullName } from "../../../utils/formatFullName";
import { getHomePath } from "../../../utils/getHomePath";
import Avatar from "../../common/avatar/Avatar";
import "./topbar.css";

// barra in alto: logo a sinistra, menu dell'utente a destra
const Topbar = () => {
  const { user, logout } = useAuth();
  return (
    <header className="app-topbar">
      {/* il logo riporta alla pagina iniziale */}
      <Link to={getHomePath(user.role)} className="app-logo">
        Store<span>Squad</span>
      </Link>

      {/* align="end": il menu si apre a destra, dentro lo schermo */}
      <Dropdown align="end">
        <Dropdown.Toggle variant="light" className="app-user">
          <Avatar user={user} />
          <span className="app-user-name">{formatFullName(user)}</span>
        </Dropdown.Toggle>
        <DropdownMenu>
          <DropdownItem as={Link} to={`${getHomePath(user.role)}/profile`}>
            Profilo
          </DropdownItem>
          <DropdownItem onClick={logout}>Esci</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </header>
  );
};

export default Topbar;
