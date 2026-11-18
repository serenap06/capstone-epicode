import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { createStock, updateStock } from "../../../api/stocks";
import Button from "../../common/button/Button";
import FormField from "../../common/formField/FormField";
import Message from "../../common/message/Message";

// controllo dei numeri: valueAsNumber trasforma il campo in numero, qui verifico che sia intero e >= 0
const numberRules = (requiredMessage) => ({
  valueAsNumber: true,
  required: requiredMessage,
  validate: (value) =>
    (Number.isInteger(value) && value >= 0) ||
    "Scrivi un numero intero da 0 in su",
});

// modulo di una giacenza, nel modale. stock: quella da modificare, oppure null per una nuova.
// In modifica si cambiano solo quantità e soglia; per una nuova si scelgono anche negozio e prodotto.
// stocks: le giacenze che esistono già, per non proporre un prodotto che il negozio ha già
const StockForm = ({ stock, stores, products, stocks, onSaved, onCancel }) => {
  const [serverError, setServerError] = useState("");
  const isEditing = Boolean(stock);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      store: "",
      product: "",
      amount: stock?.amount ?? 0,
      minThreshold: stock?.minThreshold ?? 5,
    },
  });

  const selectedStore = useWatch({ control, name: "store" });

  // i prodotti che il negozio scelto non ha ancora (some: true se almeno una giacenza combacia)
  const availableProducts = products.filter(
    (product) =>
      !stocks.some(
        (item) =>
          item.store._id === selectedStore && item.product._id === product._id,
      ),
  );

  // cambiando negozio azzero il prodotto: nell'altro negozio potrebbe esserci già
  useEffect(() => {
    setValue("product", "");
  }, [selectedStore, setValue]);

  const onSubmit = async (formData) => {
    setServerError("");
    try {
      if (isEditing) {
        await updateStock(stock._id, {
          amount: formData.amount,
          minThreshold: formData.minThreshold,
        });
      } else {
        await createStock(formData);
      }
      onSaved();
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="form-stack">
      {serverError && <Message type="error">{serverError}</Message>}

      {isEditing ? (
        // in modifica prodotto e negozio non cambiano: li scrivo e basta
        <p className="m-0">
          <strong>{stock.product.name}</strong> · {stock.store.name}
        </p>
      ) : (
        <>
          <FormField
            label="Negozio"
            htmlFor="stock-store"
            error={errors.store?.message}
          >
            <select
              id="stock-store"
              className="form-input"
              aria-invalid={errors.store ? "true" : "false"}
              {...register("store", { required: "Scegli il negozio" })}
            >
              <option value="">Scegli un negozio</option>
              {stores.map((store) => (
                <option key={store._id} value={store._id}>
                  {store.name}
                </option>
              ))}
            </select>
          </FormField>

          {/* il prodotto si sceglie dopo il negozio: prima il menu è spento */}
          <FormField
            label="Prodotto"
            htmlFor="stock-product"
            error={errors.product?.message}
          >
            <select
              id="stock-product"
              className="form-input"
              disabled={!selectedStore}
              aria-invalid={errors.product ? "true" : "false"}
              {...register("product", { required: "Scegli il prodotto" })}
            >
              <option value="">
                {selectedStore
                  ? "Scegli un prodotto"
                  : "Scegli prima il negozio"}
              </option>
              {availableProducts.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </FormField>
          {selectedStore && availableProducts.length === 0 && (
            <p className="form-hint m-0">
              Questo negozio ha già tutti i prodotti del catalogo.
            </p>
          )}
        </>
      )}

      <div className="form-row">
        <FormField
          label="Quantità"
          htmlFor="stock-amount"
          error={errors.amount?.message}
        >
          <input
            id="stock-amount"
            type="number"
            min="0"
            inputMode="numeric"
            className="form-input"
            aria-invalid={errors.amount ? "true" : "false"}
            {...register("amount", numberRules("Scrivi la quantità"))}
          />
        </FormField>
        <FormField
          label="Soglia minima"
          htmlFor="stock-threshold"
          error={errors.minThreshold?.message}
        >
          <input
            id="stock-threshold"
            type="number"
            min="0"
            inputMode="numeric"
            className="form-input"
            aria-invalid={errors.minThreshold ? "true" : "false"}
            {...register("minThreshold", numberRules("Scrivi la soglia"))}
          />
        </FormField>
      </div>
      <p className="form-hint m-0">
        Quando la quantità arriva alla soglia, la riga diventa "Sotto soglia".
      </p>

      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Salvataggio..."
            : isEditing
              ? "Salva"
              : "Crea giacenza"}
        </Button>
      </div>
    </form>
  );
};

export default StockForm;
