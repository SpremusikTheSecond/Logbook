import { createEmptyLogbook, LOGBOOK_FIELDS, STORAGE_VERSION } from "./schema.js";

const STORAGE_KEY = "easa-fcl070-logbook";

export function loadLocalLogbook() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return createEmptyLogbook();

  try {
    return normalizeLogbook(JSON.parse(saved));
  } catch {
    return createEmptyLogbook();
  }
}

export function saveLocalLogbook(logbook) {
  const payload = {
    ...normalizeLogbook(logbook),
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function clearLocalLogbook() {
  localStorage.removeItem(STORAGE_KEY);
}

export function normalizeLogbook(candidate) {
  const entries = Array.isArray(candidate?.entries) ? candidate.entries : [];
  return {
    version: candidate?.version || STORAGE_VERSION,
    createdAt: candidate?.createdAt || new Date().toISOString(),
    updatedAt: candidate?.updatedAt || new Date().toISOString(),
    entries: entries.length ? entries.map(normalizeEntry) : createEmptyLogbook().entries
  };
}

export function normalizeEntry(entry) {
  return LOGBOOK_FIELDS.reduce((normalized, field) => {
    normalized[field.key] = entry?.[field.key] ?? "";
    return normalized;
  }, {});
}

export function downloadJson(logbook) {
  const blob = new Blob([JSON.stringify(normalizeLogbook(logbook), null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pilot-logbook-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(normalizeLogbook(JSON.parse(reader.result)));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
