// numero scritto come prezzo all'italiana: 318.5 diventa "318,50 €"
// (il punto delle migliaia compare da 10.000 in su: "12.500,00 €")
export const formatEuro = (value) =>
  value.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
