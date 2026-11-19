// import
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { createSupplyRequest } from "../../../api/supplyRequests";

import Button from "../../common/button/Button";
import FormField from "../../common/formField/FormField";
import Message from "../../common/message/Message";

// componente SupplyRequestForm: nuova richiesta del dipendente, nel modale.
// props: products = gli attivi, stocks = le giacenze del negozio, openProductIds = già in attesa,
// defaultValues = prodotto e quantità già scelti (da "Da riordinare"), onSaved, onCancel
const SupplyRequestForm = ({
  products,
  stocks,
  openProductIds,
  defaultValues,
  onSaved,
  onCancel,
}) => {
  // errore del server
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  // il prodotto scelto e la sua giacenza (undefined se il negozio non ce l'ha)
  const selectedProduct = useWatch({ control, name: "product" });
  const selectedStock = stocks.find(
    (stock) => stock.product._id === selectedProduct,
  );

  // invio la richiesta
  const onSubmit = async (formData) => {
    setServerError("");
    try {
      await createSupplyRequest(formData);
      onSaved();
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="form-stack">
      {serverError && <Message type="error">{serverError}</Message>}

      <FormField
        label="Prodotto"
        htmlFor="supply-product"
        error={errors.product?.message}
      >
        <select
          id="supply-product"
          className="form-input"
          aria-invalid={errors.product ? "true" : "false"}
          {...register("product", { required: "Scegli il prodotto" })}
        >
          <option value="">Scegli un prodotto</option>
          {/* quelli già richiesti restano nel menu, ma spenti */}
          {products.map((product) => (
            <option
              key={product._id}
              value={product._id}
              disabled={openProductIds.includes(product._id)}
            >
              {product.name}
              {openProductIds.includes(product._id) && " · già richiesto"}
            </option>
          ))}
        </select>
      </FormField>
      {/* quanti pezzi ci sono adesso */}
      {selectedProduct && (
        <p className="form-hint m-0">
          {selectedStock
            ? `In negozio: ${selectedStock.amount} pz · soglia ${selectedStock.minThreshold}`
            : "Questo prodotto non è ancora nelle giacenze del negozio"}
        </p>
      )}

      <FormField
        label="Quantità"
        htmlFor="supply-amount"
        error={errors.requestedAmount?.message}
      >
        <input
          id="supply-amount"
          type="number"
          min="1"
          inputMode="numeric"
          className="form-input"
          aria-invalid={errors.requestedAmount ? "true" : "false"}
          {...register("requestedAmount", {
            valueAsNumber: true,
            required: "Scrivi la quantità",
            validate: (value) =>
              (Number.isInteger(value) && value >= 1) ||
              "Scrivi un numero intero da 1 in su",
          })}
        />
      </FormField>

      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Invio..." : "Invia richiesta"}
        </Button>
      </div>
    </form>
  );
};

export default SupplyRequestForm;
