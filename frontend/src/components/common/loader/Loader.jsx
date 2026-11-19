// import
import "./loader.css";
import { Spinner } from "react-bootstrap";

// componente Loader: la rotellina mentre arrivano i dati (role="status" per lo screen reader)
const Loader = ({ label = "Caricamento..." }) => {
  return (
    <div className="loader" role="status">
      <Spinner animation="border" size="sm" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
};

export default Loader;
