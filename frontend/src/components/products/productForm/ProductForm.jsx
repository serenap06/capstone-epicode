// import
import "./productForm.css";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Camera } from "lucide-react";
import {
  createProduct,
  removeProductImage,
  updateProduct,
  uploadProductImage,
} from "../../../api/products";
import Button from "../../common/button/Button";
import FormField from "../../common/formField/FormField";
import Message from "../../common/message/Message";

// aliquote IVA accettate dal backend
const VAT_RATES = [4, 5, 10, 22];

// peso massimo della foto, come nel backend
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

// componente ProductForm: modulo del prodotto, nel modale.
// props: product = da modificare (null = nuovo), categories = suggerite mentre scrivo, onSaved, onCancel
const ProductForm = ({ product, categories, onSaved, onCancel }) => {
  // errore del server
  const [serverError, setServerError] = useState("");
  // foto scelta e il suo indirizzo per l'anteprima
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // true dopo "Rimuovi foto" (sul server la tolgo solo con Salva)
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  // l'input del file è nascosto: lo apre la fotocamera
  const fileInputRef = useRef(null);
  const isEditing = Boolean(product);

  // campi vuoti per un prodotto nuovo
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: product?.name ?? "",
      price: product?.price ?? "",
      category: product?.category ?? "",
      vatRate: product?.vatRate ?? 22,
      brand: product?.brand ?? "",
      description: product?.description ?? "",
      active: product?.active ?? true,
    },
  });

  // il nome mentre scrivo: senza foto mostro l'iniziale
  const name = useWatch({ control, name: "name" });

  // foto da mostrare: quella scelta, altrimenti quella salvata
  const photoUrl = previewUrl ?? (isImageRemoved ? null : product?.image);

  // apro la scelta del file
  const openFilePicker = () => fileInputRef.current.click();

  // scelgo la foto: controllo il peso e creo l'anteprima (createObjectURL; revoke libera la vecchia)
  const chooseImage = (event) => {
    const file = event.target.files[0];
    // svuoto l'input: così posso scegliere di nuovo lo stesso file
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      setServerError("La foto supera i 2 MB");
      return;
    }
    setServerError("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // "Rimuovi foto": tolgo l'anteprima e segno da togliere quella salvata (vale solo con Salva)
  const removeImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl(null);
    setIsImageRemoved(true);
  };

  // salvo: prima i dati (JSON), poi la foto (FormData), che ha bisogno dell'_id
  const onSubmit = async (formData) => {
    setServerError("");
    const productData = {
      name: formData.name,
      price: formData.price,
      category: formData.category,
      vatRate: formData.vatRate,
      active: formData.active,
      // anche vuote: così in modifica si cancellano
      brand: formData.brand,
      description: formData.description,
    };

    try {
      const savedProduct = isEditing
        ? await updateProduct(product._id, productData)
        : await createProduct(productData);
      // poi la foto: la carico, oppure la tolgo
      if (imageFile) {
        await uploadProductImage(savedProduct._id, imageFile);
      } else if (isImageRemoved && product?.image) {
        await removeProductImage(savedProduct._id);
      }
      onSaved();
    } catch (e) {
      setServerError(e.message);
    }
  };

  const submitLabel = isEditing ? "Salva" : "Crea prodotto";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="form-stack">
      {serverError && <Message type="error">{serverError}</Message>}

      {/* foto: riquadro con la fotocamera in alto a destra */}
      <div className="product-form-photo">
        <div className="product-form-frame">
          {photoUrl ? (
            <img src={photoUrl} alt="" />
          ) : (
            <span aria-hidden="true">{name?.[0]?.toUpperCase() || "?"}</span>
          )}
          <button
            type="button"
            className="product-form-camera"
            aria-label={photoUrl ? "Cambia foto" : "Aggiungi foto"}
            onClick={openFilePicker}
          >
            <Camera size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="form-hint m-0">
          {imageFile
            ? `Foto scelta: ${imageFile.name}`
            : "png, jpg o webp · massimo 2 MB"}
        </p>
        {/* "Rimuovi foto" solo se c'è una foto */}
        {photoUrl && (
          <button
            type="button"
            className="product-form-remove"
            onClick={removeImage}
          >
            Rimuovi foto
          </button>
        )}
        {/* input nascosto con i formati accettati */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="d-none"
          onChange={chooseImage}
        />
      </div>

      <FormField
        label="Nome"
        htmlFor="product-name"
        error={errors.name?.message}
      >
        <input
          id="product-name"
          type="text"
          className="form-input"
          aria-invalid={errors.name ? "true" : "false"}
          {...register("name", { required: "Scrivi il nome" })}
        />
      </FormField>

      {/* prezzo (IVA compresa) e IVA sulla stessa riga; valueAsNumber = numero */}
      <div className="form-row">
        <FormField
          label="Prezzo (€)"
          htmlFor="product-price"
          error={errors.price?.message}
        >
          <input
            id="product-price"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            className="form-input"
            aria-invalid={errors.price ? "true" : "false"}
            {...register("price", {
              valueAsNumber: true,
              required: "Scrivi il prezzo",
              // campo vuoto = NaN
              validate: (value) =>
                (!Number.isNaN(value) && value >= 0) ||
                "Scrivi un prezzo da 0 in su",
            })}
          />
        </FormField>
        <FormField label="IVA" htmlFor="product-vat">
          <select
            id="product-vat"
            className="form-input"
            {...register("vatRate", { valueAsNumber: true })}
          >
            {VAT_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate}%
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* categoria e marca sulla stessa riga */}
      <div className="form-row">
        <FormField
          label="Categoria"
          htmlFor="product-category"
          error={errors.category?.message}
        >
          {/* datalist: suggerisce le categorie che esistono, ma se ne può scrivere una nuova */}
          <input
            id="product-category"
            type="text"
            list="product-categories"
            className="form-input"
            aria-invalid={errors.category ? "true" : "false"}
            {...register("category", { required: "Scrivi la categoria" })}
          />
          <datalist id="product-categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </FormField>
        <FormField label="Marca" htmlFor="product-brand">
          <input
            id="product-brand"
            type="text"
            className="form-input"
            {...register("brand")}
          />
        </FormField>
      </div>

      <FormField label="Descrizione" htmlFor="product-description">
        <textarea
          id="product-description"
          rows={2}
          className="form-input"
          {...register("description")}
        />
      </FormField>

      {/* non attivo: il dipendente non lo vede */}
      <label className="form-check-row">
        <input type="checkbox" {...register("active")} />
        Prodotto attivo (visibile ai dipendenti)
      </label>

      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvataggio..." : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
