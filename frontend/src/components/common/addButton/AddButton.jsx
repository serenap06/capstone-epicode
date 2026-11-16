import { Plus } from "lucide-react";
import Button from "../button/Button";

// bottone "+" per aggiungere (Nuova task, Nuovo utente...). label: il testo del bottone.
// iconOnly: solo il "+" (su telefono, accanto al titolo); l'aria-label tiene il testo
// per lo screen reader anche quando non si vede
const AddButton = ({ label, iconOnly = false, onClick }) => {
  return (
    <Button
      aria-label={label}
      className={iconOnly ? "app-button-icon" : ""}
      onClick={onClick}
    >
      <Plus size={18} aria-hidden="true" />
      {!iconOnly && label}
    </Button>
  );
};

export default AddButton;
