// import
import api from "./api";

// richieste delle giacenze (solo il responsabile)

// nuova giacenza: prodotto, negozio, quantità e soglia
export const createStock = async (stockData) => {
  const data = await api("/stocks", { method: "POST", body: stockData });
  return data.stock;
};

// cambio quantità e soglia
export const updateStock = async (stockId, stockData) => {
  const data = await api(`/stocks/${stockId}`, {
    method: "PATCH",
    body: stockData,
  });
  return data.stock;
};

// elimino la giacenza
export const deleteStock = async (stockId) => {
  await api(`/stocks/${stockId}`, { method: "DELETE" });
};
