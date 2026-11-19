// categorie come { value, label } per i filtri, con la maiuscola
export const toCategoryOptions = (categories) =>
  categories.map((category) => ({
    value: category,
    label: category[0].toUpperCase() + category.slice(1),
  }));
