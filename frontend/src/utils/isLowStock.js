// true se la quantità è alla soglia o sotto (come lowStock nel backend)
export const isLowStock = (stock) => stock.amount <= stock.minThreshold;
