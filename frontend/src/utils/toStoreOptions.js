// i negozi nel formato { value, label } dei filtri (FilterSelect e FilterChips)
export const toStoreOptions = (stores) =>
  stores.map((store) => ({ value: store._id, label: store.name }));
