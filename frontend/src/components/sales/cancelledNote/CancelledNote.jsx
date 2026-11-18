import "./cancelledNote.css";
import { formatFullName } from "../../../utils/formatFullName";
import { formatTime } from "../../../utils/formatTime";

// i dettagli di una vendita annullata, che si aprono con CancelledToggle:
// chi l'ha annullata, a che ora e il motivo intero. cancelledBy arriva con nome e cognome
const CancelledNote = ({ sale }) => {
  return (
    <div className="cancelled-note">
      <p>
        Annullata
        {sale.cancelledBy && ` da ${formatFullName(sale.cancelledBy)}`} alle{" "}
        {formatTime(sale.cancelledAt)}
      </p>
      <p>
        <strong>Motivo:</strong> {sale.cancelReason}
      </p>
    </div>
  );
};

export default CancelledNote;
