// percentuale da 0 a 100: 2 su 3 → 67 (con total 0 dà 0)
export const getPercent = (part, total) =>
  total ? Math.min(100, Math.round((part / total) * 100)) : 0;
