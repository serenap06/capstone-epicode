// restituisce una copia della lista ordinata (sort non tocca l'originale, che è lo stato).
// getValue dice su cosa ordinare; i testi con localeCompare (A→Z, accenti compresi),
// i numeri con la sottrazione. direction "desc" inverte il risultato.
// sort è stabile: a parità di valore resta l'ordine che la lista aveva prima
export const sortList = (list, getValue, direction) => {
  const sign = direction === "desc" ? -1 : 1;
  return [...list].sort((first, second) => {
    const firstValue = getValue(first);
    const secondValue = getValue(second);
    const result =
      typeof firstValue === "string"
        ? firstValue.localeCompare(secondValue)
        : firstValue - secondValue;
    return result * sign;
  });
};
