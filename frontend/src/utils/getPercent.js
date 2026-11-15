// percentuale di "part" su "total", da 0 a 100.
// Esempio: 2 task fatte su 3 → 2 / 3 * 100 = 66,6 → arrotondato 67.
// Se total è zero il risultato è 0 (dividere per zero darebbe NaN e la barra si romperebbe);
// Math.min tiene il risultato al massimo a 100, così la barra non esce dal bordo
export const getPercent = (part, total) =>
  total ? Math.min(100, Math.round((part / total) * 100)) : 0;
