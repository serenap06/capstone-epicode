// ore con al massimo un decimale: 7.5 → "7,5"
export const formatHours = (hours) =>
  hours.toLocaleString("it-IT", { maximumFractionDigits: 1 });
