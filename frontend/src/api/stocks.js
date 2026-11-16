import api from "./api";

// richieste sulle giacenze (solo per il responsabile: il dipendente le legge e basta)

export const createStock = async (stockData) => {
  const data = await api("/stocks", { method: "POST", body: stockData });
  return data.stock;
};

// si cambiano solo quantità e soglia
export const updateStock = async (stockId, stockData) => {
  const data = await api(`/stocks/${stockId}`, {
    method: "PATCH",
    body: stockData,
  });
  return data.stock;
};

export const deleteStock = async (stockId) => {
  await api(`/stocks/${stockId}`, { method: "DELETE" });
};
