"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Download, FileText, ImageIcon, TableIcon } from "lucide-react"
import { exportToJson, exportToCsv, exportToPdf, exportToPng } from "@/utils/export-utils"
import type { ExportFormat, ExportOptions, GradeClass, GradeTableData } from "@/types/grade-calculator"
import { useToast } from "@/hooks/use-toast"

interface ExportDialogProps {
  data: {
    classes: GradeClass[]
    tableData?: GradeTableData[]
    settings?: any
  }
  containerRef?: React.RefObject<HTMLElement>
  trigger?: React.ReactNode
}

export function ExportDialog({ data, containerRef, trigger }: ExportDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<ExportFormat>("json")
  const [filename, setFilename] = useState("grade-calculator-export")
  const [includeSettings, setIncludeSettings] = useState(true)
  const [includeCharts, setIncludeCharts] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)

      const exportData = {
        classes: data.classes,
        ...(includeSettings && data.settings ? { settings: data.settings } : {}),
      }

      const options: ExportOptions = {
        filename,
        format,
        title: "Grade Calculator Export",
        includeCharts,
      }

      switch (format) {
        case "json":
          exportToJson(exportData, `${filename}.json`)
          break
        case "csv":
          // For CSV, we need to flatten the data structure
          const flattenedData = data.classes.map((cls) => ({
            name: cls.name,
            current: cls.current,
            weight: cls.weight,
            target: cls.target,
            credits: cls.credits || 0,
          }))
          exportToCsv(flattenedData, `${filename}.csv`)
          break
        case "pdf":
          if (containerRef?.current) {
            await exportToPdf(containerRef.current, options)
          } else {
            throw new Error("Container reference is required for PDF export")
          }
          break
        case "png":
          if (containerRef?.current) {
            await exportToPng(containerRef.current, options)
          } else {
            throw new Error("Container reference is required for PNG export")
          }
          break
      }

      toast({
        title: "Export successful",
        description: `Your data has been exported as ${format.toUpperCase()}`,
      })

      setOpen(false)
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>Choose a format and options for exporting your grade calculator data.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="grade-calculator-export"
            />
          </div>

          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="format-json" />
                <Label htmlFor="format-json" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  JSON (Complete data)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="format-csv" />
                <Label htmlFor="format-csv" className="flex items-center gap-2 cursor-pointer">
                  <TableIcon className="h-4 w-4" />
                  CSV (Spreadsheet)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="format-pdf" disabled={!containerRef?.current} />
                <Label
                  htmlFor="format-pdf"
                  className={`flex items-center gap-2 cursor-pointer ${!containerRef?.current ? "opacity-50" : ""}`}
                >
                  <FileText className="h-4 w-4" />
                  PDF (Document)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="png" id="format-png" disabled={!containerRef?.current} />
                <Label
                  htmlFor="format-png"
                  className={`flex items-center gap-2 cursor-pointer ${!containerRef?.current ? "opacity-50" : ""}`}
                >
                  <ImageIcon className="h-4 w-4" />
                  PNG (Image)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-settings"
                  checked={includeSettings}
                  onCheckedChange={(checked) => setIncludeSettings(checked as boolean)}
                  disabled={format === "csv" || format === "png"}
                />
                <Label
                  htmlFor="include-settings"
                  className={`cursor-pointer ${format === "csv" || format === "png" ? "opacity-50" : ""}`}
                >
                  Include settings
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-charts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                  disabled={format !== "pdf" && format !== "png"}
                />
                <Label
                  htmlFor="include-charts"
                  className={`cursor-pointer ${format !== "pdf" && format !== "png" ? "opacity-50" : ""}`}
                >
                  Include charts and visualizations
                </Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
