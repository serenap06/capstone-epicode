// percentuale da 0 a 100, arrotondata: 2 su 3 → 67.
// Con total 0 restituisce 0 (niente NaN) e non supera mai 100
export const getPercent = (part, total) =>
  total ? Math.min(100, Math.round((part / total) * 100)) : 0;
