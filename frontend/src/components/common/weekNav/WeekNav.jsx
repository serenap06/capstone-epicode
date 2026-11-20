// import
import "./weekNav.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

import CalendarMenu from "../calendarMenu/CalendarMenu";

// componente WeekNav: frecce, bottone "in corso" e calendario (Turni, Vendite, Report, Task).
// props: onPrevious, onNext, onToday, isCurrentWeek = spegne il bottone, le tre scritte (di base la settimana),
// onPickDate(giorno) = se c'è, il calendario; selectedDate e period = il periodo mostrato (colorato nel calendario)
const WeekNav = ({
  onPrevious,
  onNext,
  onToday,
  isCurrentWeek,
  previousLabel = "Settimana precedente",
  nextLabel = "Settimana successiva",
  todayLabel = "Questa settimana",
  onPickDate,
  selectedDate,
  period = "week",
}) => {
  return (
    <div className="week-nav">
      {/* frecce solo con l'icona: aria-label dice cosa fanno */}
      <button
        className="week-nav-arrow"
        type="button"
        aria-label={previousLabel}
        onClick={onPrevious}
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
      <button
        className="week-nav-today"
        type="button"
        onClick={onToday}
        disabled={isCurrentWeek}
      >
        {todayLabel}
      </button>
      <button
        className="week-nav-arrow"
        type="button"
        aria-label={nextLabel}
        onClick={onNext}
      >
        <ChevronRight size={20} aria-hidden="true" />
      </button>
      {/* calendario: salto a un giorno qualsiasi */}
      {onPickDate && (
        <CalendarMenu
          selectedDate={selectedDate}
          period={period}
          onSelect={onPickDate}
        />
      )}
    </div>
  );
};

export default WeekNav;
