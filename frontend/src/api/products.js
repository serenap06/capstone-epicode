// import
import api from "./api";

// richieste del catalogo (solo il responsabile)

// nuovo prodotto (la foto va dopo con uploadProductImage)
export const createProduct = async (productData) => {
  const data = await api("/products", { method: "POST", body: productData });
  return data.product;
};

// modifico i dati (la foto no)
export const updateProduct = async (productId, productData) => {
  const data = await api(`/products/${productId}`, {
    method: "PATCH",
    body: productData,
  });
  return data.product;
};

// carico la foto: "image" è il nome che aspetta il backend
export const uploadProductImage = async (productId, file) => {
  const formData = new FormData();
  formData.append("image", file);
  const data = await api(`/products/${productId}/image`, {
    method: "PATCH",
    body: formData,
  });
  return data.product;
};

// tolgo la foto
export const removeProductImage = async (productId) => {
  const data = await api(`/products/${productId}/image`, { method: "DELETE" });
  return data.product;
};

// elimino il prodotto (il server toglie anche giacenze e richieste)
export const deleteProduct = async (productId) => {
  await api(`/products/${productId}`, { method: "DELETE" });
};
