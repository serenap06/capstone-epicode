// import
import api from "./api";

// richieste dei negozi (solo il responsabile)

// nuovo negozio
export const createStore = async (storeData) => {
  const data = await api("/stores", { method: "POST", body: storeData });
  return data.store;
};

// modifico il negozio
export const updateStore = async (storeId, storeData) => {
  const data = await api(`/stores/${storeId}`, {
    method: "PATCH",
    body: storeData,
  });
  return data.store;
};

// elimino il negozio (il server rifiuta se ha personale o vendite)
export const deleteStore = async (storeId) => {
  await api(`/stores/${storeId}`, { method: "DELETE" });
};
