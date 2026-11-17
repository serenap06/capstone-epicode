import api from "./api";

// richieste sul catalogo (solo per il responsabile: il dipendente lo legge e basta)

// nuovo prodotto: i dati, senza la foto (la foto va con uploadProductImage)
export const createProduct = async (productData) => {
  const data = await api("/products", { method: "POST", body: productData });
  return data.product;
};

// modifica i dati del prodotto (la foto no)
export const updateProduct = async (productId, productData) => {
  const data = await api(`/products/${productId}`, {
    method: "PATCH",
    body: productData,
  });
  return data.product;
};

// carica la foto del prodotto. "image" è il nome che il backend si aspetta
// (uploadProductImage.single("image")), come "avatar" per la foto profilo
export const uploadProductImage = async (productId, file) => {
  const formData = new FormData();
  formData.append("image", file);
  const data = await api(`/products/${productId}/image`, {
    method: "PATCH",
    body: formData,
  });
  return data.product;
};

// toglie la foto del prodotto (nell'app torna il segnaposto con l'iniziale)
export const removeProductImage = async (productId) => {
  const data = await api(`/products/${productId}/image`, { method: "DELETE" });
  return data.product;
};

// elimina il prodotto: il server toglie anche le sue giacenze e richieste
export const deleteProduct = async (productId) => {
  await api(`/products/${productId}`, { method: "DELETE" });
};
