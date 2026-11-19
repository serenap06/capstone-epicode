// prezzo all'italiana: 318.5 → "318,50 €"
export const formatEuro = (value) =>
  value.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
