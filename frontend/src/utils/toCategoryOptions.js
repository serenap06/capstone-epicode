// le categorie nel formato { value, label } dei filtri, con la maiuscola ("libri" → "Libri")
export const toCategoryOptions = (categories) =>
  categories.map((category) => ({
    value: category,
    label: category[0].toUpperCase() + category.slice(1),
  }));
