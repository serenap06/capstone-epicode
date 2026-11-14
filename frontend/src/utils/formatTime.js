// Orario senza zero iniziale nelle ore, per esempio "9:00" o "15:30"
export const formatTime = (date) => {
  const time = new Date(date);
  const minutes = String(time.getMinutes()).padStart(2, "0");
  return `${time.getHours()}:${minutes}`;
};

// Orario corto: solo l'ora se i minuti sono zero ("9"), altrimenti completo ("9:30")
const formatShortTime = (date) =>
  new Date(date).getMinutes() === 0
    ? String(new Date(date).getHours())
    : formatTime(date);

// Fascia oraria compatta, per esempio "9 – 17" oppure "9:30 – 17"
export const formatHourRange = (start, end) =>
  `${formatShortTime(start)} – ${formatShortTime(end)}`;

// Fascia oraria completa, per esempio "9:00 – 17:00"
export const formatTimeRange = (start, end) =>
  `${formatTime(start)} – ${formatTime(end)}`;
