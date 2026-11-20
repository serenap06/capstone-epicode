// import
import "./closeCashForm.css";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { closeCashSession } from "../../../api/cashSessions";
import { formatCashDifference } from "../../../utils/formatCashDifference";
import { formatEuro } from "../../../utils/formatEuro";

import Button from "../../common/button/Button";
import FormField from "../../common/formField/FormField";
import Message from "../../common/message/Message";

// regola dei due importi: da 0 in su (campo vuoto = NaN)
const amountRules = {
  valueAsNumber: true,
  validate: (value) =>
    (!Number.isNaN(value) && value >= 0) || "Scrivi un importo da 0 in su",
};

// importo scritto → numero (campo vuoto = NaN)
const toAmount = (value) => (value === "" ? NaN : Number(value));

// componente CloseCashForm: modulo "Chiudi la cassa" con imbustato, fondo di chiusura e differenza.
// props: cashSession, cashSales e cardSales = incasso contanti e POS di oggi, onSaved, onCancel
const CloseCashForm = ({
  cashSession,
  cashSales,
  cardSales,
  onSaved,
  onCancel,
}) => {
  // errore del server
  const [serverError, setServerError] = useState("");

  // il fondo di chiusura parte uguale a quello di oggi; l'imbustato lo conto io
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      closingFloat: cashSession.openingFloat,
      envelopeAmount: "",
    },
  });

  // i due importi mentre scrivo, per la differenza
  const [closingFloat, envelopeAmount] = useWatch({
    control,
    name: ["closingFloat", "envelopeAmount"],
  });

  // totale contanti = fondo di apertura + incasso contanti; contati = imbustato + fondo di chiusura
  const expectedCash = cashSession.openingFloat + cashSales;
  const countedCash = toAmount(closingFloat) + toAmount(envelopeAmount);
  // null finché manca un importo; centesimi tondi e || 0 per non mostrare "-0,00 €"
  const difference = Number.isNaN(countedCash)
    ? null
    : Math.round((countedCash - expectedCash) * 100) / 100 || 0;

  // chiudo la cassa (il server ricalcola tutto)
  const onSubmit = async (formData) => {
    setServerError("");
    try {
      await closeCashSession({
        closingFloat: formData.closingFloat,
        envelopeAmount: formData.envelopeAmount,
      });
      onSaved();
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="form-stack">
      {serverError && <Message type="error">{serverError}</Message>}

      {/* l'incasso di oggi e quanto deve esserci nel cassetto (il POS non conta nei contanti) */}
      <dl className="cash-summary">
        <div className="cash-summary-row">
          <dt>Fondo di apertura</dt>
          <dd>{formatEuro(cashSession.openingFloat)}</dd>
        </div>
        <div className="cash-summary-row">
          <dt>Incasso contanti</dt>
          <dd>{formatEuro(cashSales)}</dd>
        </div>
        <div className="cash-summary-row">
          <dt>Incasso POS</dt>
          <dd>{formatEuro(cardSales)}</dd>
        </div>
        <div className="cash-summary-row cash-summary-total">
          <dt>Totale contanti</dt>
          <dd>{formatEuro(expectedCash)}</dd>
        </div>
      </dl>

      {/* i due importi contati, affiancati: imbustato e fondo di chiusura */}
      <div className="form-row">
        <FormField
          label="Incasso imbustato (€)"
          htmlFor="envelope-amount"
          error={errors.envelopeAmount?.message}
        >
          <input
            id="envelope-amount"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            className="form-input"
            aria-invalid={errors.envelopeAmount ? "true" : "false"}
            {...register("envelopeAmount", amountRules)}
          />
        </FormField>
        <FormField
          label="Fondo di chiusura (€)"
          htmlFor="closing-float"
          error={errors.closingFloat?.message}
        >
          <input
            id="closing-float"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            className="form-input"
            aria-invalid={errors.closingFloat ? "true" : "false"}
            {...register("closingFloat", amountRules)}
          />
        </FormField>
      </div>

      {/* contati e differenza, mentre scrivo */}
      <dl className="cash-summary">
        <div className="cash-summary-row">
          <dt>Contanti contati</dt>
          <dd>{difference === null ? "—" : formatEuro(countedCash)}</dd>
        </div>
        <div className="cash-summary-row cash-summary-total">
          <dt>Differenza</dt>
          <dd>
            {difference === null ? "—" : formatCashDifference(difference)}
          </dd>
        </div>
      </dl>

      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Indietro
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Chiusura..." : "Chiudi la cassa"}
        </Button>
      </div>
    </form>
  );
};

export default CloseCashForm;
