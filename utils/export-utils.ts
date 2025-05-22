import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export type ExportFormat = "pdf" | "csv" | "png" | "json"

export interface ExportOptions {
  filename?: string
  title?: string
  includeCharts?: boolean
  includeDetails?: boolean
}

// Export data to JSON
export const exportToJson = (data: any, filename = "export.json") => {
  const dataStr = JSON.stringify(data, null, 2)
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

  const exportFilename = filename.endsWith(".json") ? filename : `${filename}.json`

  const linkElement = document.createElement("a")
  linkElement.setAttribute("href", dataUri)
  linkElement.setAttribute("download", exportFilename)
  linkElement.click()
}

// Export data to CSV
export const exportToCsv = (data: any[], filename = "export.csv") => {
  // Convert object array to CSV string
  const headers = Object.keys(data[0])
  const csvRows = []

  // Add headers
  csvRows.push(headers.join(","))

  // Add rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header]
      // Handle strings with commas by wrapping in quotes
      return typeof value === "string" && value.includes(",") ? `"${value}"` : value
    })
    csvRows.push(values.join(","))
  }

  const csvString = csvRows.join("\n")
  const dataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvString)}`

  const exportFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`

  const linkElement = document.createElement("a")
  linkElement.setAttribute("href", dataUri)
  linkElement.setAttribute("download", exportFilename)
  linkElement.click()
}

// Export element to PDF
export const exportToPdf = async (element: HTMLElement, options: ExportOptions = {}): Promise<void> => {
  const { filename = "export.pdf", title = "Export", includeDetails = true } = options

  try {
    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
    })

    // Add title
    pdf.setFontSize(18)
    pdf.text(title, 15, 15)
    pdf.setFontSize(12)

    // Capture the element as an image
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    })

    const imgData = canvas.toDataURL("image/png")
    const imgWidth = 180
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Add the image to the PDF
    pdf.addImage(imgData, "PNG", 15, 25, imgWidth, imgHeight)

    // Save the PDF
    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`)
  } catch (error) {
    console.error("Error exporting to PDF:", error)
    throw error
  }
}

// Export element to PNG
export const exportToPng = async (element: HTMLElement, options: ExportOptions = {}): Promise<void> => {
  const { filename = "export.png" } = options

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    })

    const dataUrl = canvas.toDataURL("image/png")

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUrl)
    linkElement.setAttribute("download", filename.endsWith(".png") ? filename : `${filename}.png`)
    linkElement.click()
  } catch (error) {
    console.error("Error exporting to PNG:", error)
    throw error
  }
}
