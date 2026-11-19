// funzioni per gli orari

// "9:00" o "15:30" (padStart: 5 → "05")
export const formatTime = (date) => {
  const time = new Date(date);
  const minutes = String(time.getMinutes()).padStart(2, "0");
  return `${time.getHours()}:${minutes}`;
};

// "9" se i minuti sono zero, altrimenti "9:30"
const formatShortTime = (date) =>
  new Date(date).getMinutes() === 0
    ? String(new Date(date).getHours())
    : formatTime(date);

// fascia corta: "9 – 17"
export const formatHourRange = (start, end) =>
  `${formatShortTime(start)} – ${formatShortTime(end)}`;

// fascia completa: "9:00 – 17:00"
export const formatTimeRange = (start, end) =>
  `${formatTime(start)} – ${formatTime(end)}`;
