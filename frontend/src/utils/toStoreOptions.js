// negozi come { value, label } per i filtri
export const toStoreOptions = (stores) =>
  stores.map((store) => ({ value: store._id, label: store.name }));
