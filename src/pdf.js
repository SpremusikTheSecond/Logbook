export function exportPdf() {
  const previousTitle = document.title;
  document.title = `Pilot Logbook ${new Date().toISOString().slice(0, 10)}`;
  window.print();
  document.title = previousTitle;
}
