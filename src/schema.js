export const STORAGE_VERSION = 1;

export const FIELD_TYPES = {
  TEXT: "text",
  ICAO: "icao",
  REGISTRATION: "registration",
  CLOCK: "clock",
  DURATION: "duration",
  CHECKBOX: "checkbox",
  DATE: "date",
  INTEGER: "integer",
  TEXTAREA: "textarea"
};

export const LOGBOOK_FIELDS = [
  { key: "date", label: "Date", type: FIELD_TYPES.DATE, width: 124 },
  { key: "departurePlace", label: "Departure place", type: FIELD_TYPES.ICAO, placeholder: "EPWA", width: 78 },
  { key: "departureTime", label: "Departure time", type: FIELD_TYPES.CLOCK, placeholder: "1234", width: 74 },
  { key: "arrivalPlace", label: "Arrival place", type: FIELD_TYPES.ICAO, placeholder: "EDDF", width: 78 },
  { key: "arrivalTime", label: "Arrival time", type: FIELD_TYPES.CLOCK, placeholder: "1420", width: 74 },
  { key: "aircraftType", label: "Make, model, variant", type: FIELD_TYPES.TEXT, width: 150 },
  { key: "registration", label: "Registration", type: FIELD_TYPES.REGISTRATION, width: 96, maxLength: 7 },
  { key: "singleEngineTime", label: "SE", type: FIELD_TYPES.CHECKBOX, width: 48 },
  { key: "multiEngineTime", label: "ME", type: FIELD_TYPES.CHECKBOX, width: 48 },
  { key: "multiPilotTime", label: "Multi-pilot time", type: FIELD_TYPES.DURATION, width: 86 },
  { key: "totalTime", label: "Total time of flight", type: FIELD_TYPES.DURATION, readonly: true, width: 90 },
  { key: "picName", label: "Name PIC", type: FIELD_TYPES.TEXT, width: 120 },
  { key: "takeoffsDay", label: "Takeoffs day", type: FIELD_TYPES.INTEGER, width: 66 },
  { key: "takeoffsNight", label: "Takeoffs night", type: FIELD_TYPES.INTEGER, width: 66 },
  { key: "landingsDay", label: "Landings day", type: FIELD_TYPES.INTEGER, width: 66 },
  { key: "landingsNight", label: "Landings night", type: FIELD_TYPES.INTEGER, width: 66 },
  { key: "nightTime", label: "Night", type: FIELD_TYPES.DURATION, width: 70 },
  { key: "ifrTime", label: "IFR", type: FIELD_TYPES.DURATION, width: 70 },
  { key: "picTime", label: "Pilot-in-command", type: FIELD_TYPES.DURATION, width: 86 },
  { key: "copilotTime", label: "Co-pilot", type: FIELD_TYPES.DURATION, width: 78 },
  { key: "dualTime", label: "Dual", type: FIELD_TYPES.DURATION, width: 70 },
  { key: "instructorTime", label: "Instructor", type: FIELD_TYPES.DURATION, width: 82 },
  { key: "simDate", label: "STD date", type: FIELD_TYPES.DATE, width: 124 },
  { key: "simType", label: "STD type", type: FIELD_TYPES.TEXT, width: 86 },
  { key: "simTime", label: "STD total time", type: FIELD_TYPES.DURATION, width: 88 },
  { key: "remarks", label: "Remarks and endorsements", type: FIELD_TYPES.TEXTAREA, width: 190 }
];

export function createEmptyEntry() {
  return LOGBOOK_FIELDS.reduce((entry, field) => {
    entry[field.key] = field.type === FIELD_TYPES.CHECKBOX ? false : "";
    return entry;
  }, {});
}

export function createEmptyLogbook() {
  return {
    version: STORAGE_VERSION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    entries: [createEmptyEntry()]
  };
}
