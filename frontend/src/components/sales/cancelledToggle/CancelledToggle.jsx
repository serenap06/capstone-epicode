import "./cancelledToggle.css";
import { ChevronDown } from "lucide-react";

// il pulsante di una vendita annullata: cliccandolo si aprono (o si chiudono) i dettagli.
// isOpen: dettagli aperti; onToggle: apre o chiude.
// label: il testo ("Annullata" a forma di badge, "Vendita annullata" al posto di "Annulla vendita").
// ariaLabel: il nome completo per lo screen reader (in pagina ci sono più pulsanti uguali).
// aria-expanded dice allo screen reader se i dettagli sono aperti
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
      {/* la freccia si gira quando i dettagli sono aperti (vedi il CSS) */}
      <ChevronDown size={14} aria-hidden="true" />
    </button>
  );
};

export default CancelledToggle;
