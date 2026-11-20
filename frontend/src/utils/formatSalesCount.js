// "1 vendita", "12 vendite"
export const formatSalesCount = (count) =>
  `${count} ${count === 1 ? "vendita" : "vendite"}`;
