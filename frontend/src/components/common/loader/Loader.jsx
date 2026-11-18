import "./loader.css";
import { Spinner } from "react-bootstrap";

// la rotellina mentre arrivano i dati, al posto dei messaggi "Nessun...".
// role="status": lo screen reader dice "Caricamento..." senza interrompere
const Loader = ({ label = "Caricamento..." }) => {
  return (
    <div className="loader" role="status">
      <Spinner animation="border" size="sm" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
};

export default Loader;
