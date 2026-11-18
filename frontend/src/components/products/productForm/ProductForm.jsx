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

// aliquote IVA che il backend accetta
const VAT_RATES = [4, 5, 10, 22];

// peso massimo della foto, come nel backend: 2 MB
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

// modulo del prodotto, nel modale. product: quello da modificare, oppure null per uno nuovo.
// categories: le categorie che esistono già, suggerite mentre si scrive
const ProductForm = ({ product, categories, onSaved, onCancel }) => {
  const [serverError, setServerError] = useState("");
  // la foto scelta e il suo indirizzo temporaneo per l'anteprima (null = nessuna scelta)
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // true dopo "Rimuovi foto": la foto salvata si toglie solo quando si preme Salva
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  // aggancio all'input del file, che è nascosto: lo apre il bottone della fotocamera
  const fileInputRef = useRef(null);
  const isEditing = Boolean(product);

  // con un prodotto nuovo product è null: ?. e ?? fanno partire i campi vuoti
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

  // il nome mentre si scrive: senza foto il riquadro mostra la sua iniziale
  const name = useWatch({ control, name: "name" });

  // nel riquadro: la foto appena scelta, altrimenti quella salvata (se non l'ho rimossa)
  const photoUrl = previewUrl ?? (isImageRemoved ? null : product?.image);

  // apre la finestra per scegliere il file (l'input vero è nascosto)
  const openFilePicker = () => fileInputRef.current.click();

  // scelta la foto: controllo il peso e preparo l'anteprima.
  // URL.createObjectURL crea un indirizzo temporaneo per vedere il file prima di caricarlo;
  // revokeObjectURL libera quello vecchio
  const chooseImage = (event) => {
    const file = event.target.files[0];
    // svuoto l'input, così si può scegliere di nuovo lo stesso file
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

  // "Rimuovi foto": tolgo l'anteprima della foto scelta e segno da togliere quella salvata.
  // Sul server non cambia niente finché non si preme Salva (Annulla lascia tutto com'era)
  const removeImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl(null);
    setIsImageRemoved(true);
  };

  // due richieste: prima i dati (JSON), poi la foto (FormData), solo se ne è stata scelta una.
  // La foto ha bisogno dell'_id del prodotto, per questo viene dopo
  const onSubmit = async (formData) => {
    setServerError("");
    const productData = {
      name: formData.name,
      price: formData.price,
      category: formData.category,
      vatRate: formData.vatRate,
      active: formData.active,
      // marca e descrizione vuote non le mando: il database non accetta testo vuoto
      brand: formData.brand || undefined,
      description: formData.description || undefined,
    };

    try {
      const savedProduct = isEditing
        ? await updateProduct(product._id, productData)
        : await createProduct(productData);
      // poi la foto: la nuova sostituisce la vecchia; se l'ho solo rimossa la tolgo
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

      {/* la foto come nel Profilo: riquadro con la fotocamera magenta in alto a destra */}
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
        {/* "Rimuovi foto" solo se nel riquadro c'è una foto: un link discreto, come nel Profilo */}
        {photoUrl && (
          <button
            type="button"
            className="product-form-remove"
            onClick={removeImage}
          >
            Rimuovi foto
          </button>
        )}
        {/* input nascosto: accept mostra solo i formati che il backend accetta */}
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

      {/* prezzo (IVA compresa) e IVA sulla stessa riga; valueAsNumber trasforma il testo in numero.
          Etichetta corta: su telefono "Prezzo (€, IVA compresa)" andava su due righe */}
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
              // campo vuoto = NaN: Number.isNaN lo riconosce
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
          {/* list collega il campo al datalist: il browser suggerisce le categorie che esistono,
              ma se ne può scrivere una nuova */}
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

      {/* un prodotto non attivo resta nel catalogo del responsabile ma il dipendente non lo vede */}
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
