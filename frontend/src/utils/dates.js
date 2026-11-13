const toRange = (start, end) => ({
  from: start.toISOString(),
  to: end.toISOString(),
});

// Inizio e fine di oggi
export const getToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return toRange(start, end);
};

// Da lunedì a domenica della settimana in corso
export const getWeek = () => {
  const start = new Date();
  const daysFromMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysFromMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return toRange(start, end);
};
// I sette giorni della settimana in corso, da lunedì a domenica
export const getWeekDays = () => {
  const monday = new Date(getWeek().from);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
};

// true se le due date cadono nello stesso giorno
export const isSameDay = (firstDate, secondDate) =>
  new Date(firstDate).toDateString() === new Date(secondDate).toDateString();
