// true se la giacenza è alla soglia minima o sotto (la stessa regola del filtro lowStock del backend)
export const isLowStock = (stock) => stock.amount <= stock.minThreshold;
