// import
import "./cancelledToggle.css";
import { ChevronDown } from "lucide-react";

// componente CancelledToggle: pulsante che apre o chiude i dettagli di un annullamento.
// props: isOpen, onToggle, label = "Annullata" o "Vendita annullata", ariaLabel = nome completo, large
const CancelledToggle = ({
  isOpen,
  onToggle,
  label = "Annullata",
  ariaLabel,
  large,
}) => {
  return (
    <button
      type="button"
      className={`cancelled-toggle ${large ? "cancelled-toggle-large" : ""}`}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
      onClick={onToggle}
    >
      {label}
      {/* la freccia gira quando è aperto (CSS) */}
      <ChevronDown size={14} aria-hidden="true" />
    </button>
  );
};

export default CancelledToggle;
