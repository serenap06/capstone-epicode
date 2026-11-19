// pezzi di una vendita in tutto: 2 guide + 1 magnete = 3
export const countSaleItems = (sale) =>
  sale.items.reduce((sum, item) => sum + item.quantity, 0);
