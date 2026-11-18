import "./shiftForm.css";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Trash2 } from "lucide-react";

import { createShift, updateShift } from "../../../api/shifts";
import {
  isSameDay,
  toDateInputValue,
  toTimeInputValue,
} from "../../../utils/dates";
import { formatHours } from "../../../utils/formatHours";
import { getShiftHours } from "../../../utils/getShiftHours";
import { groupByStore } from "../../../utils/groupByStore";

import Button from "../../common/button/Button";
import FilterChips from "../../common/filterBar/FilterChips";
import FormField from "../../common/formField/FormField";
import Message from "../../common/message/Message";
import HoursStatus from "../hoursStatus/HoursStatus";

// i turni più comuni: un clic su "Mattina" o "Pomeriggio" riempie inizio e fine
const SHIFT_PRESETS = [
  {
    value: "morning",
    label: "Mattina 9–17",
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    value: "afternoon",
    label: "Pomeriggio 13–21",
    startTime: "13:00",
    endTime: "21:00",
  },
];

// minuti dalla mezzanotte: "09:30" → 570
const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// ore tra inizio e fine dello stesso giorno; 0 se manca un orario o la fine non è dopo l'inizio
const getDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  return Math.max(0, (toMinutes(endTime) - toMinutes(startTime)) / 60);
};

// modulo del turno, nel modale. shift: il turno da modificare, oppure null per uno nuovo.
// defaults: persona e giorno già scelti (clic su "Riposo"); employees: le righe delle ore,
// con il negozio di ognuno; weekDays: i giorni della settimana mostrata
const ShiftForm = ({
  shift,
  defaults,
  employees,
  weekDays,
  onSaved,
  onCancel,
  onDelete,
}) => {
  const [serverError, setServerError] = useState("");
  const isEditing = Boolean(shift);

  // giorno di partenza per un turno nuovo: quello cliccato, oggi se è in questa settimana, o lunedì
  const startDay =
    defaults?.day ??
    weekDays.find((day) => isSameDay(day, new Date())) ??
    weekDays[0];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: isEditing
      ? {
          user: shift.user._id,
          day: toDateInputValue(shift.startAt),
          startTime: toTimeInputValue(shift.startAt),
          endTime: toTimeInputValue(shift.endAt),
        }
      : {
          user: defaults?.employeeId ?? "",
          day: toDateInputValue(startDay),
          startTime: "",
          endTime: "",
        },
  });

  // useWatch rilegge i campi a ogni modifica: il riepilogo si aggiorna mentre scegli
  const [selectedUser, startTime, endTime] = useWatch({
    control,
    name: ["user", "startTime", "endTime"],
  });

  // riepilogo: durata del turno e totale della settimana con questo turno.
  // Se modifico, la durata vecchia è già nelle ore della persona: la tolgo
  const duration = getDuration(startTime, endTime);
  const employee = employees.find((row) => row.employeeId === selectedUser);
  const oldDuration =
    isEditing && shift.user._id === selectedUser ? getShiftHours(shift) : 0;
  const weekTotal = employee
    ? employee.scheduledHours - oldDuration + duration
    : 0;

  // il pulsante acceso è quello con gli stessi orari dei campi ("" = nessuno)
  const activePreset =
    SHIFT_PRESETS.find(
      (preset) => preset.startTime === startTime && preset.endTime === endTime,
    )?.value ?? "";

  // clic su un pulsante: scrivo inizio e fine; shouldValidate ricontrolla i campi
  // (così sparisce un errore rimasto da prima)
  const choosePreset = (value) => {
    const preset = SHIFT_PRESETS.find((preset) => preset.value === value);
    setValue("startTime", preset.startTime, { shouldValidate: true });
    setValue("endTime", preset.endTime, { shouldValidate: true });
  };

  // le persone divise per negozio, per il menu a tendina
  const groups = groupByStore(employees);

  // "2026-11-16" e "09:00" diventano una data con l'ora di qui; toISOString per il server.
  // Il negozio è quello della persona scelta (funziona anche con "Tutti" i negozi)
  const onSubmit = async (formData) => {
    setServerError("");
    const chosenEmployee = employees.find(
      (row) => row.employeeId === formData.user,
    );
    const shiftData = {
      user: formData.user,
      store: chosenEmployee.store._id,
      startAt: new Date(`${formData.day}T${formData.startTime}`).toISOString(),
      endAt: new Date(`${formData.day}T${formData.endTime}`).toISOString(),
    };
    try {
      if (isEditing) {
        await updateShift(shift._id, shiftData);
      } else {
        await createShift(shiftData);
      }
      onSaved();
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="form-stack">
      {serverError && <Message type="error">{serverError}</Message>}

      <FormField
        label="Dipendente"
        htmlFor="shift-user"
        error={errors.user?.message}
      >
        <select
          id="shift-user"
          className="form-input"
          aria-invalid={errors.user ? "true" : "false"}
          {...register("user", { required: "Scegli il dipendente" })}
        >
          <option value="">Scegli un dipendente</option>
          {/* optgroup: le persone sotto il nome del loro negozio */}
          {groups.map((group) => (
            <optgroup key={group.store._id} label={group.store.name}>
              {group.rows.map((row) => (
                <option key={row.employeeId} value={row.employeeId}>
                  {row.employee}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </FormField>

      {/* min e max: il giorno si sceglie solo nella settimana mostrata */}
      <FormField label="Giorno" htmlFor="shift-day" error={errors.day?.message}>
        <input
          id="shift-day"
          type="date"
          className="form-input"
          min={toDateInputValue(weekDays[0])}
          max={toDateInputValue(weekDays[6])}
          aria-invalid={errors.day ? "true" : "false"}
          {...register("day", { required: "Scegli il giorno" })}
        />
      </FormField>

      {/* orari veloci: riempiono i campi sotto, che restano modificabili.
          Il div d-flex tiene i pulsanti larghi quanto il testo */}
      <div className="d-flex">
        <FilterChips
          label="Orario veloce"
          options={SHIFT_PRESETS}
          value={activePreset}
          onChange={choosePreset}
        />
      </div>

      {/* validate: la fine va bene solo se viene dopo l'inizio ("17:00" > "09:00") */}
      <div className="form-row">
        <FormField
          label="Inizio"
          htmlFor="shift-start"
          error={errors.startTime?.message}
        >
          <input
            id="shift-start"
            type="time"
            className="form-input"
            aria-invalid={errors.startTime ? "true" : "false"}
            {...register("startTime", { required: "Scegli l'inizio" })}
          />
        </FormField>
        <FormField
          label="Fine"
          htmlFor="shift-end"
          error={errors.endTime?.message}
        >
          <input
            id="shift-end"
            type="time"
            className="form-input"
            aria-invalid={errors.endTime ? "true" : "false"}
            {...register("endTime", {
              required: "Scegli la fine",
              validate: (value, formValues) =>
                value > formValues.startTime ||
                "La fine deve essere dopo l'inizio",
            })}
          />
        </FormField>
      </div>

      {/* riepilogo viola, solo quando c'è una persona scelta */}
      {employee && (
        <div className="shift-form-summary" aria-live="polite">
          <div>
            <p className="shift-form-summary-label">Durata del turno</p>
            <p className="shift-form-summary-value">
              {formatHours(duration)} h
            </p>
          </div>
          <div>
            <p className="shift-form-summary-label">
              Totale di {employee.employee} questa settimana
            </p>
            <HoursStatus
              scheduled={weekTotal}
              contract={employee.weeklyHours ?? 0}
            />
          </div>
        </div>
      )}

      {/* in modifica c'è anche Elimina, a sinistra (me-auto lo spinge lontano dagli altri) */}
      <div className="form-actions">
        {isEditing && (
          <Button
            variant="danger"
            className="me-auto"
            onClick={() => onDelete(shift)}
          >
            <Trash2 size={16} aria-hidden="true" />
            Elimina
          </Button>
        )}
        <Button variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvataggio..." : isEditing ? "Salva" : "Crea turno"}
        </Button>
      </div>
    </form>
  );
};

export default ShiftForm;
