export const formatEuro = (value)=>
    value.toLocaleString("it-IT",{style: "currency", currency: "EUR"})
