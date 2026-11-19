// import
import "./cancelledNote.css";
import { formatFullName } from "../../../utils/formatFullName";
import { formatTime } from "../../../utils/formatTime";

// componente CancelledNote: chi ha annullato la vendita, a che ora e il motivo. props: sale
const CancelledNote = ({ sale }) => {
  return (
    <div className="cancelled-note">
      <p>
        Annullata
        {sale.cancelledBy &&
          ` da ${formatFullName(sale.cancelledBy)}`} alle{" "}
        {formatTime(sale.cancelledAt)}
      </p>
      <p>
        <strong>Motivo:</strong> {sale.cancelReason}
      </p>
    </div>
  );
};

export default CancelledNote;
