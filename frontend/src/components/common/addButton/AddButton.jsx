// import
import { Plus } from "lucide-react";
import Button from "../button/Button";

// componente AddButton: bottone "+" (Nuova task, Nuovo utente...).
// props: label = il testo, iconOnly = solo il "+" (su telefono), onClick = cosa fa
const AddButton = ({ label, iconOnly = false, onClick }) => {
  return (
    <Button
      aria-label={label} // il testo resta per lo screen reader anche senza scritta
      className={iconOnly ? "app-button-icon" : ""}
      onClick={onClick}
    >
      <Plus size={18} aria-hidden="true" />
      {!iconOnly && label}
    </Button>
  );
};

export default AddButton;
