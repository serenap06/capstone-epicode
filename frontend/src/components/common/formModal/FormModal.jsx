// import
import "./formModal.css";
import { useId } from "react";
import { Modal } from "react-bootstrap";

// componente FormModal: finestra con un modulo (si chiude con Esc o cliccando fuori).
// props: show, title, onClose, wide = più larga per i moduli su due colonne, children = il modulo
const FormModal = ({ show, title, onClose, wide = false, children }) => {
  // id per collegare la finestra al titolo
  const titleId = useId();

  return (
    // in mezzo allo schermo; a tutto schermo su telefono
    <Modal
      show={show}
      onHide={onClose}
      centered
      fullscreen="sm-down"
      aria-labelledby={titleId}
      className={wide ? "form-modal form-modal-wide" : "form-modal"}
    >
      {/* la X in alto, con il nome per lo screen reader */}
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
