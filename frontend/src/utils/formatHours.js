// ore scritte all'italiana, al massimo un decimale: 7.5 → "7,5", 8 → "8"
export const formatHours = (hours) =>
  hours.toLocaleString("it-IT", { maximumFractionDigits: 1 });
