import "./weekNav.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

// frecce per cambiare settimana e bottone per tornare a quella in corso
const WeekNav = ({ onPrevious, onNext, onToday, isCurrentWeek }) => {
  return (
    <div className="week-nav">
      <button
        className="week-nav-arrow"
        type="button"
        aria-label="Settimana precedente"
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
        Questa settimana
      </button>
      <button
        className="week-nav-arrow"
        type="button"
        aria-label="Settimana successiva"
        onClick={onNext}
      >
        <ChevronRight size={20} aria-hidden="true" />
      </button>
    </div>
  );
};

export default WeekNav;
