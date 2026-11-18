import { useState } from "react";
import { useForm } from "react-hook-form";

import { cancelSale } from "../../../api/sales";
import { formatEuro } from "../../../utils/formatEuro";
import { formatSaleTime } from "../../../utils/formatSaleTime";

import Button from "../../common/button/Button";
import FormField from "../../common/formField/FormField";
import Message from "../../common/message/Message";

// lunghezza massima del motivo, come nel backend
const MAX_REASON_LENGTH = 200;

// modulo "Annulla vendita", nel modale: il motivo è obbligatorio e il responsabile lo legge.
// sale: la vendita da annullare; onSaved: dopo l'annullamento; onCancel: chiude senza fare niente
const CancelSaleForm = ({ sale, onSaved, onCancel }) => {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { reason: "" } });

  // trim: un motivo fatto solo di spazi non vale
  const onSubmit = async ({ reason }) => {
    setServerError("");
    try {
      await cancelSale(sale._id, reason.trim());
      onSaved();
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="form-stack">
      {serverError && <Message type="error">{serverError}</Message>}

      {/* quale vendita sto annullando, per non sbagliare riga */}
      <p className="m-0">
        Vendita delle <strong>{formatSaleTime(sale.createdAt)}</strong> da{" "}
        <strong>{formatEuro(sale.total)}</strong>. I pezzi tornano nel negozio.
      </p>

      <FormField
        label="Motivo"
        htmlFor="cancel-reason"
        error={errors.reason?.message}
      >
        <textarea
          id="cancel-reason"
          rows={3}
          className="form-input"
          placeholder="Per esempio: errore nel metodo di pagamento"
          aria-invalid={errors.reason ? "true" : "false"}
          {...register("reason", {
            validate: (value) =>
              value.trim() !== "" || "Scrivi il motivo dell'annullamento",
            maxLength: {
              value: MAX_REASON_LENGTH,
              message: `Al massimo ${MAX_REASON_LENGTH} caratteri`,
            },
          })}
        />
      </FormField>

      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Indietro
        </Button>
        <Button type="submit" variant="danger" disabled={isSubmitting}>
          {isSubmitting ? "Annullamento..." : "Annulla vendita"}
        </Button>
      </div>
    </form>
  );
};

export default CancelSaleForm;
