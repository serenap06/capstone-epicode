// ordine dopo il clic su un'intestazione: stessa colonna inverte, colonna nuova crescente
export const getNextSort = (prevSort, field) => ({
  field,
  direction:
    prevSort.field === field && prevSort.direction === "asc" ? "desc" : "asc",
});
