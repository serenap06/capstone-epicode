import "./formModal.css";
import { useId } from "react";
import { Modal } from "react-bootstrap";

// finestra che si apre sopra la pagina e contiene un modulo, per esempio "Nuova task".
// show: true per aprirla; title: il titolo; onClose: la funzione della pagina che la chiude;
// children: il modulo, scritto dalla pagina tra i tag;
// wide: true per i moduli lunghi su due colonne, così da 992px in su la finestra è più larga.
// Il Modal di react-bootstrap fa già da solo le cose importanti:
// Esc e il clic fuori la chiudono, il Tab resta dentro la finestra e la pagina sotto non scorre
const FormModal = ({ show, title, onClose, wide = false, children }) => {
  // id unico per collegare la finestra al suo titolo (lo legge lo screen reader all'apertura)
  const titleId = useId();

  return (
    // centered: in mezzo allo schermo; fullscreen="sm-down": a tutto schermo su telefono
    <Modal
      show={show}
      onHide={onClose}
      centered
      fullscreen="sm-down"
      aria-labelledby={titleId}
      className={wide ? "form-modal form-modal-wide" : "form-modal"}
    >
      {/* closeButton aggiunge la X in alto a destra; closeLabel è il suo nome per gli screen reader */}
      <Modal.Header closeButton closeLabel="Chiudi">
        <Modal.Title id={titleId} className="form-modal-title">
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
};

export default FormModal;
