// numero scritto come prezzo all'italiana: 1250.5 diventa "1.250,50 €"
export const formatEuro = (value)=>
    value.toLocaleString("it-IT",{style: "currency", currency: "EUR"})
