// import
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

// turni veloci: "Mattina" o "Pomeriggio" riempiono inizio e fine
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

// ore tra inizio e fine (0 se manca un orario o la fine è prima)
const getDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  return Math.max(0, (toMinutes(endTime) - toMinutes(startTime)) / 60);
};

// componente ShiftForm: modulo del turno, nel modale.
// props: shift = da modificare (null = nuovo), defaults = persona e giorno già scelti,
// employees = le righe delle ore, weekDays, onSaved, onCancel, onDelete
const ShiftForm = ({
  shift,
  defaults,
  employees,
  weekDays,
  onSaved,
  onCancel,
  onDelete,
}) => {
  // errore del server
  const [serverError, setServerError] = useState("");
  const isEditing = Boolean(shift);

  // giorno di partenza: quello cliccato, oggi se è in questa settimana, o lunedì
  const startDay =
    defaults?.day ??
    weekDays.find((day) => isSameDay(day, new Date())) ??
    weekDays[0];

  // campi del modulo: in modifica quelli del turno
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

  // rileggo i campi a ogni modifica: il riepilogo si aggiorna
  const [selectedUser, startTime, endTime] = useWatch({
    control,
    name: ["user", "startTime", "endTime"],
  });

  // riepilogo: durata e totale della settimana (in modifica tolgo la durata vecchia)
  const duration = getDuration(startTime, endTime);
  const employee = employees.find((row) => row.employeeId === selectedUser);
  const oldDuration =
    isEditing && shift.user._id === selectedUser ? getShiftHours(shift) : 0;
  const weekTotal = employee
    ? employee.scheduledHours - oldDuration + duration
    : 0;

  // pulsante acceso: quello con gli stessi orari
  const activePreset =
    SHIFT_PRESETS.find(
      (preset) => preset.startTime === startTime && preset.endTime === endTime,
    )?.value ?? "";

  // clic su un turno veloce: scrivo inizio e fine e ricontrollo i campi
  const choosePreset = (value) => {
    const preset = SHIFT_PRESETS.find((preset) => preset.value === value);
    setValue("startTime", preset.startTime, { shouldValidate: true });
    setValue("endTime", preset.endTime, { shouldValidate: true });
  };

  // persone per negozio, per il menu
  const groups = groupByStore(employees);

  // salvo: giorno e ora diventano una data ISO; il negozio è quello della persona
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
          {/* le persone sotto il loro negozio */}
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

      {/* il giorno solo nella settimana mostrata */}
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

      {/* turni veloci (i campi sotto restano modificabili) */}
      <div className="d-flex">
        <FilterChips
          label="Orario veloce"
          options={SHIFT_PRESETS}
          value={activePreset}
          onChange={choosePreset} // riempio inizio e fine
        />
      </div>

      {/* la fine deve venire dopo l'inizio */}
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

      {/* riepilogo, quando c'è una persona */}
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
              scheduled={weekTotal} // le ore della settimana con questo turno
              contract={employee.weeklyHours ?? 0}
            />
          </div>
        </div>
      )}

      {/* in modifica anche Elimina, a sinistra */}
      <div className="form-actions">
        {isEditing && (
          <Button
            variant="danger"
            className="me-auto"
            onClick={() => onDelete(shift)} // chiedo conferma prima di eliminare
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
