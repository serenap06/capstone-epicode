// nuovo ordine dopo il clic su un'intestazione: sulla stessa colonna inverte
// (crescente ↔ decrescente), su una colonna nuova parte da crescente
export const getNextSort = (prevSort, field) => ({
  field,
  direction:
    prevSort.field === field && prevSort.direction === "asc" ? "desc" : "asc",
});
