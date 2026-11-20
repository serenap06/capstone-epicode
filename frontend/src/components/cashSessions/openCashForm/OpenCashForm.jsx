// import
import { useState } from "react";
import { useForm } from "react-hook-form";

import { openCashSession } from "../../../api/cashSessions";
import { formatEuro } from "../../../utils/formatEuro";

import Button from "../../common/button/Button";
import FormField from "../../common/formField/FormField";
import Message from "../../common/message/Message";

// componente OpenCashForm: modulo "Apri la cassa" con il fondo cassa.
// props: lastClosingFloat = ultimo fondo di chiusura (già nel campo), onSaved, onCancel
const OpenCashForm = ({ lastClosingFloat, onSaved, onCancel }) => {
  // errore del server
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { openingFloat: lastClosingFloat } });

  // apro la cassa con il fondo contato
  const onSubmit = async ({ openingFloat }) => {
    setServerError("");
    try {
      await openCashSession(openingFloat);
      onSaved();
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="form-stack">
      {serverError && <Message type="error">{serverError}</Message>}

      {/* il fondo dell'ultima chiusura, se c'è */}
      <p className="m-0">
        Conta i contanti nel cassetto e scrivi il fondo cassa.
        {lastClosingFloat > 0 && (
          <>
            {" "}
            L'ultima chiusura ha lasciato{" "}
            <strong>{formatEuro(lastClosingFloat)}</strong>.
          </>
        )}
      </p>

      <FormField
        label="Fondo cassa (€)"
        htmlFor="opening-float"
        error={errors.openingFloat?.message}
      >
        <input
          id="opening-float"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          className="form-input"
          aria-invalid={errors.openingFloat ? "true" : "false"}
          {...register("openingFloat", {
            valueAsNumber: true,
            // campo vuoto = NaN
            validate: (value) =>
              (!Number.isNaN(value) && value >= 0) ||
              "Scrivi un importo da 0 in su",
          })}
        />
      </FormField>

      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Indietro
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Apertura..." : "Apri la cassa"}
        </Button>
      </div>
    </form>
  );
};

export default OpenCashForm;
