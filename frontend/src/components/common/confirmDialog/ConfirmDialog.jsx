import { useId } from "react";
import { Modal } from "react-bootstrap";
import Button from "../button/Button";
import "./confirmDialog.css";

// finestra di conferma per le azioni che non si possono annullare (eliminare).
// isLoading: true mentre aspetto il server; onConfirm e onCancel arrivano dalla pagina
const ConfirmDialog = ({
  show,
  title,
  message,
  confirmLabel = "Conferma",
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  // id unico per collegare la finestra al titolo (aria-labelledby)
  const titleId = useId();

  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      aria-labelledby={titleId}
      className="confirm-dialog"
    >
      <Modal.Header closeButton closeLabel="Chiudi">
        <Modal.Title id={titleId} className="confirm-dialog-title">
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="confirm-dialog-message">{message}</p>
        {/* la conferma si disattiva mentre aspetto il server: niente doppi clic */}
        <div className="confirm-dialog-actions">
          <Button variant="secondary" onClick={onCancel}>
            Annulla
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Attendi..." : confirmLabel}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmDialog;
