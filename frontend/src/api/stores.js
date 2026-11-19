import api from "./api";

// richieste sui negozi (solo per il responsabile)

// nuovo negozio: nome, indirizzo e città
export const createStore = async (storeData) => {
  const data = await api("/stores", { method: "POST", body: storeData });
  return data.store;
};

// modifica i dati del negozio
export const updateStore = async (storeId, storeData) => {
  const data = await api(`/stores/${storeId}`, {
    method: "PATCH",
    body: storeData,
  });
  return data.store;
};

// il server rifiuta se il negozio ha ancora personale o delle vendite
export const deleteStore = async (storeId) => {
  await api(`/stores/${storeId}`, { method: "DELETE" });
};
