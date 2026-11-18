import api from "./api";

// richieste sulle vendite

// registra una vendita dalla Cassa (solo il dipendente, nel suo negozio).
// saleData: { items: [{ product, quantity }], paymentMethod: "cash" | "card" }.
// Il server scala i pezzi dalle giacenze e risponde con la vendita
// e con i prodotti rimasti sotto la soglia (lowStock)
export const createSale = async (saleData) => {
  const data = await api("/sales", { method: "POST", body: saleData });
  return { sale: data.sale, lowStock: data.lowStock };
};

// annulla una vendita di oggi (solo chi l'ha fatta) con il motivo obbligatorio.
// Il server la segna come annullata e rimette i pezzi nel negozio
export const cancelSale = async (saleId, reason) => {
  const data = await api(`/sales/${saleId}/cancel`, {
    method: "PATCH",
    body: { reason },
  });
  return data.sale;
};
