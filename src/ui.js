import { buildFooterCells, calculateTotals, enrichEntry, minutesToDuration } from "./calculations.js";
import { FIELD_TYPES, LOGBOOK_FIELDS, createEmptyEntry, createEmptyLogbook } from "./schema.js";
import { downloadJson, loadLocalLogbook, readJsonFile, saveLocalLogbook } from "./storage.js";
import { exportPdf } from "./pdf.js";
import { validateEntry, validateField } from "./validation.js";

const tableHead = document.getElementById("table-head");
const tableCols = document.getElementById("table-cols");
const tableBody = document.getElementById("logbook-body");
const tableFoot = document.getElementById("table-foot");
const statusMessage = document.getElementById("status-message");
const fileInput = document.getElementById("json-file");

let logbook = loadLocalLogbook();
let validationErrors = {};

export function initUi() {
  renderHead();
  bindActions();
  render();
}

function bindActions() {
  document.getElementById("new-logbook").addEventListener("click", () => {
    if (!confirm("Start a new empty logbook? Export JSON first if you need a backup.")) return;
    logbook = saveLocalLogbook(createEmptyLogbook());
    setStatus("New logbook created.");
    render();
  });

  document.getElementById("load-json").addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async () => {
    const [file] = fileInput.files;
    if (!file) return;

    try {
      logbook = saveLocalLogbook(await readJsonFile(file));
      setStatus(`Loaded ${file.name}.`);
      render();
    } catch {
      setStatus("Could not load that JSON file.");
    } finally {
      fileInput.value = "";
    }
  });

  document.getElementById("save-json").addEventListener("click", () => {
    downloadJson(logbook);
    setStatus("JSON export created.");
  });

  document.getElementById("export-pdf").addEventListener("click", exportPdf);

  document.getElementById("add-row").addEventListener("click", () => {
    logbook.entries.push(createEmptyEntry());
    persistAndRender("Flight row added.");
  });
}

function render() {
  const enrichedEntries = logbook.entries.map(enrichEntry);
  const validation = validateLogbook(enrichedEntries);
  validationErrors = validation.errors;
  logbook = { ...logbook, entries: validation.entries };

  renderBody();
  renderFoot();
  renderSummary();
}

function renderHead() {
  tableCols.innerHTML = LOGBOOK_FIELDS.map((field) => `<col style="width:${field.width}px">`).join("");
  tableHead.innerHTML = `
    <tr>
      <th rowspan="3">Date<br>(dd/mm/yy)</th>
      <th colspan="2">Departure</th>
      <th colspan="2">Arrival</th>
      <th colspan="2">Aircraft</th>
      <th colspan="2">Single-pilot time</th>
      <th rowspan="3">Multi-pilot<br>time</th>
      <th rowspan="3">Total time<br>of flight</th>
      <th rowspan="3">Name PIC</th>
      <th colspan="2">Takeoffs</th>
      <th colspan="2">Landings</th>
      <th colspan="2">Operational<br>condition time</th>
      <th colspan="4">Pilot function time</th>
      <th colspan="3">Synthetic training device session</th>
      <th rowspan="3">Remarks<br>and endorsements</th>
    </tr>
    <tr>
      <th>Place</th>
      <th>Time</th>
      <th>Place</th>
      <th>Time</th>
      <th>Make, model, variant</th>
      <th>Registration</th>
      <th>SE</th>
      <th>ME</th>
      <th>Day</th>
      <th>Night</th>
      <th>Day</th>
      <th>Night</th>
      <th>Night</th>
      <th>IFR</th>
      <th>PIC</th>
      <th>Co-pilot</th>
      <th>Dual</th>
      <th>Instructor</th>
      <th>Date</th>
      <th>Type</th>
      <th>Total time</th>
    </tr>
  `;
}

function renderBody() {
  tableBody.innerHTML = "";

  logbook.entries.forEach((entry, rowIndex) => {
    const tr = document.createElement("tr");

    LOGBOOK_FIELDS.forEach((field) => {
      const td = document.createElement("td");
      td.style.width = `${field.width}px`;
      td.appendChild(createControl(field, entry, rowIndex));
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

function createControl(field, entry, rowIndex) {
  const control = field.type === FIELD_TYPES.TEXTAREA
    ? document.createElement("textarea")
    : document.createElement("input");

  if (control.tagName === "INPUT") control.type = "text";
  control.value = entry[field.key] || "";
  control.placeholder = field.placeholder || "";
  control.readOnly = Boolean(field.readonly);
  control.dataset.row = rowIndex;
  control.dataset.field = field.key;

  const message = validationErrors[rowIndex]?.[field.key];
  if (message) {
    control.classList.add("is-invalid");
    control.title = message;
  }

  control.addEventListener("input", handleInput);
  control.addEventListener("blur", handleBlur);

  return control;
}

function handleInput(event) {
  const rowIndex = Number(event.target.dataset.row);
  const fieldKey = event.target.dataset.field;
  if (LOGBOOK_FIELDS.find((field) => field.key === fieldKey)?.readonly) return;

  logbook.entries[rowIndex][fieldKey] = event.target.value;
  logbook.entries[rowIndex] = enrichEntry(logbook.entries[rowIndex]);
  logbook = saveLocalLogbook(logbook);
  renderFoot();
  renderSummary();
}

function handleBlur(event) {
  const rowIndex = Number(event.target.dataset.row);
  const field = LOGBOOK_FIELDS.find((item) => item.key === event.target.dataset.field);
  if (!field || field.readonly) return;

  const validation = validateField(field, event.target.value);
  logbook.entries[rowIndex][field.key] = validation.value;
  logbook.entries[rowIndex] = enrichEntry(logbook.entries[rowIndex]);
  persistAndRender(validation.valid ? "" : validation.message);
}

function renderFoot() {
  const footerCells = buildFooterCells(logbook.entries);
  tableFoot.innerHTML = `
    <tr>
      <th colspan="7">Total this logbook</th>
      ${footerCells.slice(7).map((value) => `<td>${value}</td>`).join("")}
    </tr>
  `;
}

function renderSummary() {
  const totals = calculateTotals(logbook.entries);
  document.getElementById("summary-total").textContent = minutesToDuration(totals.totalTime);
  document.getElementById("summary-pic").textContent = minutesToDuration(totals.picTime);
  document.getElementById("summary-night").textContent = minutesToDuration(totals.nightTime);
  document.getElementById("summary-ifr").textContent = minutesToDuration(totals.ifrTime);
  document.getElementById("summary-dual").textContent = minutesToDuration(totals.dualTime);
  document.getElementById("summary-instructor").textContent = minutesToDuration(totals.instructorTime);
}

function validateLogbook(entries) {
  return entries.reduce((result, entry, rowIndex) => {
    const validation = validateEntry(entry, LOGBOOK_FIELDS);
    result.entries.push({ ...entry, ...validation.values });
    if (Object.keys(validation.errors).length) result.errors[rowIndex] = validation.errors;
    return result;
  }, { entries: [], errors: {} });
}

function persistAndRender(message) {
  logbook = saveLocalLogbook(logbook);
  setStatus(message || "Saved locally.");
  render();
}

function setStatus(message) {
  statusMessage.textContent = message;
}
