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
