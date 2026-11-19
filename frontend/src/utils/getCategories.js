// categorie dei prodotti senza doppioni (new Set)
export const getCategories = (products) => [
  ...new Set(products.map((product) => product.category)),
];
