import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { buildCsv } from "./csv"

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
export const exportToCsv = (data: Record<string, unknown>[], filename = "export.csv", headers?: string[]) => {
  const csvString = buildCsv(data, headers)
  const dataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvString)}`

  const exportFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`

  const linkElement = document.createElement("a")
  linkElement.setAttribute("href", dataUri)
  linkElement.setAttribute("download", exportFilename)
  linkElement.click()
}

// Capture an element and return a canvas
export const captureElement = async (
  element: HTMLElement,
): Promise<HTMLCanvasElement> => {
  return html2canvas(element, {
    scale: 2,
    logging: false,
    useCORS: true,
    allowTaint: true,
  })
}

// Capture an element and return an image data URL
export const captureElementImage = async (
  element: HTMLElement,
): Promise<string> => {
  const canvas = await captureElement(element)
  return canvas.toDataURL("image/png")
}

// Export element to PDF
export const exportToPdf = async (element: HTMLElement, options: ExportOptions = {}): Promise<void> => {
  const { filename = "export.pdf", title = "Export" } = options

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

    const width = pdf.internal.pageSize.getWidth() - 30
    const pageHeight = pdf.internal.pageSize.getHeight()
    const scale = width / canvas.width
    let y = 0
    while (y < canvas.height) {
      const top = y === 0 ? 25 : 15
      const height = Math.min(canvas.height - y, Math.floor((pageHeight - top - 15) / scale))
      const pageCanvas = document.createElement("canvas")
      pageCanvas.width = canvas.width
      pageCanvas.height = height
      const context = pageCanvas.getContext("2d")
      if (!context) throw new Error("Unable to prepare a PDF page.")
      context.drawImage(canvas, 0, y, canvas.width, height, 0, 0, canvas.width, height)
      if (y > 0) pdf.addPage()
      pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", 15, top, width, height * scale)
      y += height
    }

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

    const image = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Unable to render the PNG.")), "image/png")
    })
    const url = URL.createObjectURL(image)
    const linkElement = document.createElement("a")
    linkElement.href = url
    linkElement.download = filename.endsWith(".png") ? filename : `${filename}.png`
    document.body.appendChild(linkElement)
    linkElement.click()
    linkElement.remove()
    setTimeout(() => URL.revokeObjectURL(url), 30_000)
  } catch (error) {
    console.error("Error exporting to PNG:", error)
    throw error
  }
}
