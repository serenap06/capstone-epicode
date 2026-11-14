// percentuale di "part" su "total", da 0 a 100.
// Se total è zero il risultato è 0; non supera mai 100.
export const getPercent = (part, total) =>
  total ? Math.min(100, Math.round((part / total) * 100)) : 0;
