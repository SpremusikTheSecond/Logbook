import { LOGBOOK_FIELDS, FIELD_TYPES } from "./schema.js";
import { isValidDuration, isValidTime, normalizeTimeInput } from "./validation.js";

export const TOTAL_FIELDS = [
  "singleEngineTime",
  "multiEngineTime",
  "multiPilotTime",
  "totalTime",
  "nightTime",
  "ifrTime",
  "picTime",
  "copilotTime",
  "dualTime",
  "instructorTime",
  "simTime"
];

export function durationToMinutes(value) {
  const normalized = normalizeTimeInput(value);
  if (!normalized || !isValidDuration(normalized)) return 0;
  const [hours, minutes] = normalized.split(":").map(Number);
  return hours * 60 + minutes;
}

export function clockToMinutes(value) {
  const normalized = normalizeTimeInput(value);
  if (!normalized || !isValidTime(normalized)) return null;
  const [hours, minutes] = normalized.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToDuration(minutes) {
  const safeMinutes = Math.max(0, Number(minutes) || 0);
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function calculateFlightMinutes(entry) {
  const departure = clockToMinutes(entry.departureTime);
  const arrival = clockToMinutes(entry.arrivalTime);
  if (departure === null || arrival === null) return durationToMinutes(entry.totalTime);

  const adjustedArrival = arrival < departure ? arrival + 24 * 60 : arrival;
  return adjustedArrival - departure;
}

export function enrichEntry(entry) {
  const totalMinutes = calculateFlightMinutes(entry);
  return {
    ...entry,
    totalTime: totalMinutes > 0 ? minutesToDuration(totalMinutes) : ""
  };
}

export function calculateTotals(entries) {
  const totals = TOTAL_FIELDS.reduce((result, key) => {
    result[key] = 0;
    return result;
  }, {});

  entries.map(enrichEntry).forEach((entry) => {
    TOTAL_FIELDS.forEach((key) => {
      totals[key] += durationToMinutes(entry[key]);
    });
  });

  return totals;
}

export function buildFooterCells(entries) {
  const totals = calculateTotals(entries);
  const totalKeys = new Set(TOTAL_FIELDS);

  return LOGBOOK_FIELDS.map((field) => {
    if (totalKeys.has(field.key)) return minutesToDuration(totals[field.key]);
    if (field.type === FIELD_TYPES.INTEGER) {
      return entries.reduce((sum, entry) => sum + Number(entry[field.key] || 0), 0) || "";
    }
    return "";
  });
}
