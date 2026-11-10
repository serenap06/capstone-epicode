import { Dropdown, DropdownItem, DropdownMenu } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import "./topbar.css";

const Topbar = () => {
  const { user, logout } = useAuth();
  const initials = `${user.name[0]}${user.surname[0]}`;
  return (
    <header className="app-topbar">
      <Link to={`/${user.role}`} className="app-logo">
        Store<span>Squad</span>
      </Link>

      <Dropdown align="end">
        <Dropdown.Toggle variant="light" className="app-user">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="app-avatar"></img>
          ) : (
            <span className="app-avatar">{initials}</span>
          )}
          <span className="app-user-name">
            {user.name} {user.surname}
          </span>
        </Dropdown.Toggle>
        <DropdownMenu>
          <DropdownItem as={Link} to={`/${user.role}/profile`}>
            Profilo
          </DropdownItem>
          <DropdownItem onClick={logout}>Esci</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </header>
  );
};

export default Topbar;
