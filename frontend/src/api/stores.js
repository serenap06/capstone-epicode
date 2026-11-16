import api from "./api";

// richieste sui negozi (solo per il responsabile)

export const createStore = async (storeData) => {
  const data = await api("/stores", { method: "POST", body: storeData });
  return data.store;
};

export const updateStore = async (storeId, storeData) => {
  const data = await api(`/stores/${storeId}`, {
    method: "PATCH",
    body: storeData,
  });
  return data.store;
};

// il server rifiuta se il negozio ha ancora personale
export const deleteStore = async (storeId) => {
  await api(`/stores/${storeId}`, { method: "DELETE" });
};
