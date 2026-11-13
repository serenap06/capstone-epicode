// Orario senza zero iniziale nelle ore, per esempio "9:00" o "15:30"
export const formatTime = (date) => {
  const time = new Date(date);
  const minutes = String(time.getMinutes()).padStart(2, "0");
  return `${time.getHours()}:${minutes}`;
};

// Fascia oraria compatta, per esempio "9–17"
export const formatHourRange = (start, end) =>
  `${new Date(start).getHours()}–${new Date(end).getHours()}`;
