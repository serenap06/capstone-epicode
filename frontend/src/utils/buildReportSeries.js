import { addDays } from "./dates";

// la chiave di un periodo, uguale per le date del server e per quelle create qui:
// il giorno per giorni e settimane, anno e mese per i mesi
const toPeriodKey = (date, groupBy) => {
  const day = new Date(date);
  if (groupBy === "month") return `${day.getFullYear()}-${day.getMonth()}`;
  return day.toDateString();
};

// l'etichetta sotto la barra: "lun 17" (settimana), "17" (mese), "17 nov" (trimestre),
// "nov" (semestre e anno)
const toPeriodLabel = (date, groupBy, period) => {
  if (groupBy === "month") {
    return date.toLocaleDateString("it-IT", { month: "short" });
  }
  if (groupBy === "week") {
    return date.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  }
  if (period === "week") {
    return date.toLocaleDateString("it-IT", {
      weekday: "short",
      day: "numeric",
    });
  }
  return String(date.getDate());
};

// il periodo per esteso, per il riquadro che compare sopra la barra:
// "lunedì 9 novembre", "settimana dal 17 novembre", "novembre 2026"
const toPeriodTitle = (date, groupBy) => {
  if (groupBy === "month") {
    return date.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
  }
  const dayMonth = date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
  });
  if (groupBy === "week") return `settimana dal ${dayMonth}`;
  return `${date.toLocaleDateString("it-IT", { weekday: "long" })} ${dayMonth}`;
};

// tutte le barre del grafico, anche quelle dei giorni senza vendite (con 0):
// il server manda solo i periodi con almeno una vendita.
// series: l'andamento del server; range: { start, end, groupBy } di getPeriodRange
export const buildReportSeries = (series, { start, end, groupBy }, period) => {
  // le righe del server in un oggetto, per trovarle con la chiave
  const rowsByKey = {};
  series.forEach((row) => {
    rowsByKey[toPeriodKey(row.period, groupBy)] = row;
  });

  // la prima barra: il giorno di inizio, il lunedì della sua settimana o il primo del mese
  const current = new Date(start);
  if (groupBy === "week")
    current.setDate(current.getDate() - ((current.getDay() + 6) % 7));
  if (groupBy === "month") current.setDate(1);

  const bars = [];
  while (current <= end) {
    const row = rowsByKey[toPeriodKey(current, groupBy)];
    bars.push({
      label: toPeriodLabel(current, groupBy, period),
      title: toPeriodTitle(current, groupBy),
      revenue: row?.revenue ?? 0,
      salesCount: row?.salesCount ?? 0,
    });
    // la barra dopo: un giorno, una settimana o un mese più avanti
    if (groupBy === "day") current.setTime(addDays(current, 1).getTime());
    if (groupBy === "week") current.setTime(addDays(current, 7).getTime());
    if (groupBy === "month") current.setMonth(current.getMonth() + 1);
  }
  return bars;
};
