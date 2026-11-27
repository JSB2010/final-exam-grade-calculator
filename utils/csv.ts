const escapeCell = (value: unknown) => {
  // Treat formula-looking text as text in spreadsheet programs. Numbers keep their numeric form.
  let cell = value == null ? "" : String(value)
  if (typeof value === "string" && /^\s*[=+\-@]|^[\t\r\n]/.test(cell)) cell = "'" + cell
  return /[",\r\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell
}

export const buildCsv = (data: Record<string, unknown>[], headers = Object.keys(data[0] ?? {})) =>
  [headers.map(escapeCell), ...data.map((row) => headers.map((header) => escapeCell(row[header])))]
    .map((row) => row.join(","))
    .join("\r\n")
