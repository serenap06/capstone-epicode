import { Dropdown, DropdownItem, DropdownMenu } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { formatFullName } from "../../../utils/formatFullName";
import { getHomePath } from "../../../utils/getHomePath";
import "./topbar.css";

// barra in alto: logo a sinistra, menu dell'utente a destra
const Topbar = () => {
  const { user, logout } = useAuth();
  // iniziali per l'avatar quando non c'è la foto: prima lettera di nome e cognome
  const initials = `${user.name[0]}${user.surname[0]}`;
  return (
    <header className="app-topbar">
      {/* il logo riporta alla pagina iniziale del ruolo */}
      <Link to={getHomePath(user.role)} className="app-logo">
        Store<span>Squad</span>
      </Link>

      {/* align="end" apre il menu allineato a destra, così non esce dallo schermo */}
      <Dropdown align="end">
        <Dropdown.Toggle variant="light" className="app-user">
          {/* foto se c'è, altrimenti le iniziali */}
          {user.avatar ? (
            <img src={user.avatar} alt="" className="app-avatar"></img>
          ) : (
            <span className="app-avatar">{initials}</span>
          )}
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
