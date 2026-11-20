// import
import "./calendarMenu.css";
import { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { addDays, getWeek, isSameDay } from "../../../utils/dates";
import { formatLongDate } from "../../../utils/formatLongDate";
import { getPeriodRange } from "../../../utils/periods";

// iniziali dei giorni, da lunedì
const WEEKDAY_INITIALS = ["L", "M", "M", "G", "V", "S", "D"];

// primo giorno del mese di "date"
const getMonthStart = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

// giorni del calendario: da lunedì della settimana del giorno 1 a domenica della settimana dell'ultimo
const getCalendarDays = (monthStart) => {
  const lastOfMonth = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0,
  );
  const firstDay = new Date(getWeek(monthStart).from);
  const lastDay = new Date(getWeek(lastOfMonth).to);
  const days = [];
  for (let day = firstDay; day <= lastDay; day = addDays(day, 1)) {
    days.push(day);
  }
  return days;
};

// componente CalendarMenu: bottone con il calendario del mese; clic su un giorno = la pagina va lì.
// props: selectedDate = un giorno del periodo mostrato, period = day, week, month... (colorato tutto),
// onSelect(giorno)
const CalendarMenu = ({ selectedDate, period = "day", onSelect }) => {
  // menu aperto o chiuso e il mese mostrato
  const [isOpen, setIsOpen] = useState(false);
  const [shownMonth, setShownMonth] = useState(getMonthStart(selectedDate));

  const today = new Date();
  // il periodo della pagina, colorato nel calendario
  const range = getPeriodRange(period, selectedDate);
  // "novembre 2026"
  const monthLabel = shownMonth.toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
  });

  // apro o chiudo; aprendo riparto dal mese del periodo mostrato
  const toggleMenu = (nextIsOpen) => {
    if (nextIsOpen) setShownMonth(getMonthStart(selectedDate));
    setIsOpen(nextIsOpen);
  };

  // mese prima o dopo (step -1 o 1)
  const moveMonth = (step) =>
    setShownMonth(
      (prevMonth) =>
        new Date(prevMonth.getFullYear(), prevMonth.getMonth() + step, 1),
    );

  // scelgo un giorno: la pagina va lì e chiudo il menu
  const selectDay = (day) => {
    onSelect(day);
    setIsOpen(false);
  };

  return (
    // autoClose="outside": i clic dentro (le frecce del mese) non lo chiudono
    <Dropdown
      show={isOpen}
      onToggle={toggleMenu}
      align="end"
      autoClose="outside"
      className="calendar-menu"
    >
      <Dropdown.Toggle
        as="button"
        type="button"
        className="week-nav-arrow calendar-menu-toggle"
        aria-label="Scegli un giorno dal calendario"
      >
        <CalendarDays size={20} aria-hidden="true" />
      </Dropdown.Toggle>

      <Dropdown.Menu className="calendar-menu-panel">
        {/* il mese, con le frecce per cambiarlo */}
        <div className="calendar-menu-header">
          <button
            type="button"
            className="calendar-menu-arrow"
            aria-label="Mese precedente"
            onClick={() => moveMonth(-1)}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <p className="calendar-menu-month" aria-live="polite">
            {monthLabel}
          </p>
          <button
            type="button"
            className="calendar-menu-arrow"
            aria-label="Mese successivo"
            onClick={() => moveMonth(1)}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>

        {/* 7 colonne: le iniziali, poi i giorni */}
        <div className="calendar-menu-grid">
          {WEEKDAY_INITIALS.map((initial, index) => (
            <span
              key={index}
              className="calendar-menu-weekday"
              aria-hidden="true"
            >
              {initial}
            </span>
          ))}
          {getCalendarDays(shownMonth).map((day) => {
            const isInPeriod = day >= range.start && day <= range.end;
            const isToday = isSameDay(day, today);
            // classi: nel periodo (magenta chiaro), oggi (cerchio), di un altro mese (grigio)
            const dayClasses = [
              "calendar-menu-day",
              isInPeriod && "calendar-menu-day-selected",
              isToday && "calendar-menu-day-today",
              day.getMonth() !== shownMonth.getMonth() &&
                "calendar-menu-day-other",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={day.toDateString()}
                type="button"
                className={dayClasses}
                aria-label={formatLongDate(day)} // "venerdì 20 novembre"
                aria-pressed={isInPeriod}
                aria-current={isToday ? "date" : undefined}
                onClick={() => selectDay(day)}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CalendarMenu;
