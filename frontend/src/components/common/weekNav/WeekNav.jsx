// import
import "./weekNav.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

// componente WeekNav: frecce e bottone "in corso" (Turni, Vendite, Report).
// props: onPrevious, onNext, onToday, isCurrentWeek = spegne il bottone, le tre scritte (di base la settimana)
const WeekNav = ({
  onPrevious,
  onNext,
  onToday,
  isCurrentWeek,
  previousLabel = "Settimana precedente",
  nextLabel = "Settimana successiva",
  todayLabel = "Questa settimana",
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
    </div>
  );
};

export default WeekNav;
