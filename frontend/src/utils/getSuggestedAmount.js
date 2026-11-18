// quanti pezzi chiedere per un prodotto sotto soglia: quelli che servono
// per arrivare al doppio della soglia (almeno 1)
export const getSuggestedAmount = (stock) =>
  Math.max(stock.minThreshold * 2 - stock.amount, 1);
