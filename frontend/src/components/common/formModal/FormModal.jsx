import "./formModal.css";
import { useId } from "react";
import { Modal } from "react-bootstrap";

// finestra con un modulo, per esempio "Nuova task"; wide: più larga, per i moduli su due colonne.
// Il Modal di Bootstrap si chiude con Esc o cliccando fuori e tiene il Tab dentro la finestra
const FormModal = ({ show, title, onClose, wide = false, children }) => {
  // id unico per collegare la finestra al titolo
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
      {/* closeButton: la X in alto; closeLabel: il suo nome per gli screen reader */}
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
