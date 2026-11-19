// import
import api from "./api";

// richieste delle vendite

// registro una vendita dalla Cassa: { items: [{ product, quantity }], paymentMethod }.
// Risponde con la vendita e i prodotti finiti sotto soglia (lowStock)
export const createSale = async (saleData) => {
  const data = await api("/sales", { method: "POST", body: saleData });
  return { sale: data.sale, lowStock: data.lowStock };
};

// annullo una vendita di oggi con il motivo (i pezzi tornano nel negozio)
export const cancelSale = async (saleId, reason) => {
  const data = await api(`/sales/${saleId}/cancel`, {
    method: "PATCH",
    body: { reason },
  });
  return data.sale;
};
