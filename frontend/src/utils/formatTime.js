// Orario in formato italiano, per esempio "09:00"
export const formatTime = (date) =>
  new Date(date).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });

// Fascia oraria compatta, per esempio "9–17"
export const formatHourRange = (start, end) =>
  `${new Date(start).getHours()}–${new Date(end).getHours()}`;
