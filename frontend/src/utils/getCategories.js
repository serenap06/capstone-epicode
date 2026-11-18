// le categorie dei prodotti senza doppioni (new Set), nell'ordine in cui compaiono
export const getCategories = (products) => [
  ...new Set(products.map((product) => product.category)),
];
