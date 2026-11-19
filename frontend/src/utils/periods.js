// import
import { addDays, getWeek, getWeekDays, isSameDay } from "./dates";
import { formatWeekRange } from "./formatWeekRange";

// periodi con le frecce, per Vendite (giorno, settimana, mese) e Report (da settimana ad anno)

// periodi del Report, per i pulsanti
export const REPORT_PERIOD_OPTIONS = [
  { value: "week", label: "Settimana" },
  { value: "month", label: "Mese" },
  { value: "quarter", label: "Trimestre" },
  { value: "semester", label: "Semestre" },
  { value: "year", label: "Anno" },
];

// mesi di ogni periodo
const PERIOD_MONTHS = { month: 1, quarter: 3, semester: 6, year: 12 };

// raggruppamento del grafico: per giorno fino al mese, per settimana sul trimestre, per mese poi
const PERIOD_GROUP_BY = {
  day: "day",
  week: "day",
  month: "day",
  quarter: "week",
  semester: "month",
  year: "month",
};

// scritte delle frecce e del bottone "in corso"
export const PERIOD_NAV_LABELS = {
  day: ["Giorno precedente", "Giorno successivo", "Oggi"],
  week: ["Settimana precedente", "Settimana successiva", "Questa settimana"],
  month: ["Mese precedente", "Mese successivo", "Questo mese"],
  quarter: ["Trimestre precedente", "Trimestre successivo", "Questo trimestre"],
  semester: ["Semestre precedente", "Semestre successivo", "Questo semestre"],
  year: ["Anno precedente", "Anno successivo", "Quest'anno"],
};

// inizio, fine e raggruppamento del periodo che contiene referenceDate
// (trimestri, semestri e anni partono da gennaio)
export const getPeriodRange = (period, referenceDate) => {
  const groupBy = PERIOD_GROUP_BY[period];
  if (period === "day") {
    const start = new Date(referenceDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(referenceDate);
    end.setHours(23, 59, 59, 999);
    return { start, end, groupBy };
  }
  if (period === "week") {
    const week = getWeek(referenceDate);
    return { start: new Date(week.from), end: new Date(week.to), groupBy };
  }
  const months = PERIOD_MONTHS[period];
  const date = new Date(referenceDate);
  // primo mese del periodo: a novembre il trimestre parte da ottobre (9)
  const firstMonth = Math.floor(date.getMonth() / months) * months;
  const start = new Date(date.getFullYear(), firstMonth, 1);
  // giorno 0 del mese dopo = ultimo giorno del periodo
  const end = new Date(
    date.getFullYear(),
    firstMonth + months,
    0,
    23,
    59,
    59,
    999,
  );
  return { start, end, groupBy };
};

// data spostata di un periodo (step -1 indietro, 1 avanti)
export const movePeriodDate = (period, date, step) => {
  if (period === "day") return addDays(date, step);
  if (period === "week") return addDays(date, 7 * step);
  const newDate = new Date(date);
  // giorno 1: dal 31 gennaio + 1 mese si finirebbe a marzo
  newDate.setDate(1);
  newDate.setMonth(newDate.getMonth() + PERIOD_MONTHS[period] * step);
  return newDate;
};

// nome del periodo: "oggi", "dal 16 al 22 novembre", "novembre 2026", "2026"...
export const formatPeriod = (period, { start, end }) => {
  if (period === "day") {
    if (isSameDay(start, new Date())) return "oggi";
    return start.toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }
  if (period === "week") return formatWeekRange(getWeekDays(start));
  if (period === "year") return String(start.getFullYear());
  // nome del mese
  const monthName = (date) =>
    date.toLocaleDateString("it-IT", { month: "long" });
  if (period === "month") return `${monthName(start)} ${start.getFullYear()}`;
  return `${monthName(start)} – ${monthName(end)} ${end.getFullYear()}`;
};
