import { useId } from "react";
import { Modal } from "react-bootstrap";
import Button from "../button/Button";
import "./confirmDialog.css";

// finestra di conferma per le azioni che non si possono annullare (eliminare).
// show: true per aprirla; title e message: domanda e spiegazione;
// confirmLabel: il testo del bottone che conferma; isLoading: true mentre aspetto il server;
// onConfirm e onCancel: le funzioni della pagina
const ConfirmDialog = ({
  show,
  title,
  message,
  confirmLabel = "Conferma",
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  // useId crea un id unico: lo uso per collegare la finestra al suo titolo (aria-labelledby)
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
        {/* Annulla chiude e basta; il bottone rosso conferma.
            Mentre aspetto il server il rosso è disabilitato, così non si clicca due volte */}
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
