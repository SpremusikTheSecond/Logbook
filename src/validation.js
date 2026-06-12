import { FIELD_TYPES } from "./schema.js";

const DATE_PATTERN = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{2}$/;

export function normalizeTimeInput(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const compact = trimmed.replace(".", ":");
  if (/^\d{4}$/.test(compact)) {
    return `${compact.slice(0, 2)}:${compact.slice(2)}`;
  }

  if (/^\d{1,2}:\d{2}$/.test(compact)) {
    const [hours, minutes] = compact.split(":");
    return `${hours.padStart(2, "0")}:${minutes}`;
  }

  return compact;
}

export function isValidTime(value) {
  const normalized = normalizeTimeInput(value);
  if (!/^\d{2}:\d{2}$/.test(normalized)) return false;
  const [hours, minutes] = normalized.split(":").map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export function isValidDuration(value) {
  const normalized = normalizeTimeInput(value);
  if (!/^\d{2,4}:\d{2}$/.test(normalized)) return false;
  const [hours, minutes] = normalized.split(":").map(Number);
  return hours >= 0 && minutes >= 0 && minutes <= 59;
}

export function isValidIcao(value) {
  return value === "" || /^[A-Z]{4}$/.test(value);
}

export function isValidInteger(value) {
  return value === "" || /^\d+$/.test(String(value).trim());
}

export function normalizeFieldValue(type, value) {
  const raw = String(value || "").trim();

  if (type === FIELD_TYPES.ICAO) return raw.toUpperCase();
  if (type === FIELD_TYPES.CLOCK || type === FIELD_TYPES.DURATION) return normalizeTimeInput(raw);
  if (type === FIELD_TYPES.INTEGER) return raw.replace(/[^\d]/g, "");

  return raw;
}

export function validateField(field, value) {
  const normalized = normalizeFieldValue(field.type, value);
  if (normalized === "") return { valid: true, value: normalized, message: "" };

  if (field.type === FIELD_TYPES.ICAO && !isValidIcao(normalized)) {
    return { valid: false, value: normalized, message: "ICAO aerodrome codes must be exactly four uppercase letters." };
  }

  if (field.type === FIELD_TYPES.CLOCK && !isValidTime(normalized)) {
    return { valid: false, value: normalized, message: "Times must be valid HH:MM values." };
  }

  if (field.type === FIELD_TYPES.DURATION && !isValidDuration(normalized)) {
    return { valid: false, value: normalized, message: "Durations must be valid HH:MM values." };
  }

  if (field.type === FIELD_TYPES.DATE && !DATE_PATTERN.test(normalized)) {
    return { valid: false, value: normalized, message: "Dates must use dd/mm/yy." };
  }

  if (field.type === FIELD_TYPES.INTEGER && !isValidInteger(normalized)) {
    return { valid: false, value: normalized, message: "Counts must be whole numbers." };
  }

  return { valid: true, value: normalized, message: "" };
}

export function validateEntry(entry, fields) {
  return fields.reduce((result, field) => {
    const validation = validateField(field, entry[field.key]);
    result.values[field.key] = validation.value;
    if (!validation.valid) result.errors[field.key] = validation.message;
    return result;
  }, { values: {}, errors: {} });
}
