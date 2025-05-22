"use client"

import { useEffect, useRef } from "react"

type GradeClass = {
  id: string
  name: string
  current: number
  weight: number
  target: string
  color: string
}

type GradeBand = {
  label: string
  cutoff: number
  color: string
}

type GradeComparisonProps = {
  classes: GradeClass[]
  selectedClassId: string | null
  gradeBands: GradeBand[]
  formatGrade: (grade: number) => string
}

export default function GradeComparison({ classes, selectedClassId, gradeBands, formatGrade }: GradeComparisonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with higher resolution for retina displays
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    // Only update if dimensions have changed
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Chart dimensions
    const padding = { top: 40, right: 20, bottom: 40, left: 50 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, padding.top + chartHeight)
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
    ctx.strokeStyle = "#94a3b8" // slate-400
    ctx.lineWidth = 1
    ctx.stroke()

    // Y-axis labels (Grade)
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#64748b" // slate-500
    ctx.font = "10px system-ui, sans-serif"

    for (let i = 0; i <= 100; i += 10) {
      const y = padding.top + chartHeight - (i / 100) * chartHeight
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left - 5, y)
      ctx.stroke()
      ctx.fillText(i.toString(), padding.left - 10, y)
    }

    // Y-axis title
    ctx.save()
    ctx.translate(padding.left - 35, padding.top + chartHeight / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Current Grade (%)", 0, 0)
    ctx.restore()

    // Draw grade bands
    const sortedBands = [...gradeBands].sort((a, b) => a.cutoff - b.cutoff)

    for (let i = 0; i < sortedBands.length - 1; i++) {
      const band = sortedBands[i]
      const nextBand = sortedBands[i + 1]

      const y1 = padding.top + chartHeight - (band.cutoff / 100) * chartHeight
      const y2 = padding.top + chartHeight - (nextBand.cutoff / 100) * chartHeight

      ctx.fillStyle = band.color.replace("bg-", "").replace("-500", "").replace("-400", "")
      ctx.globalAlpha = 0.1
      ctx.fillRect(padding.left, y2, chartWidth, y1 - y2)

      // Add label
      ctx.globalAlpha = 1
      ctx.fillStyle = "#334155" // slate-700
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.font = "bold 10px system-ui, sans-serif"
      ctx.fillText(band.label, padding.left + chartWidth + 5, (y1 + y2) / 2)
    }

    // Filter and sort classes by current grade
    const sortedClasses = [...classes].sort((a, b) => b.current - a.current)

    // Calculate bar width based on number of classes
    const barWidth = chartWidth / (sortedClasses.length * 2)
    const barSpacing = barWidth / 2

    // Draw bars for each class
    sortedClasses.forEach((cls, index) => {
      const x = padding.left + index * (barWidth * 2) + barSpacing
      const barHeight = (cls.current / 100) * chartHeight
      const y = padding.top + chartHeight - barHeight

      // Highlight the selected class
      const isSelected = cls.id === selectedClassId
      const barColor = cls.color.replace("bg-", "").replace("-500", "").replace("-400", "")

      // Draw bar
      ctx.fillStyle = barColor
      ctx.globalAlpha = isSelected ? 1 : 0.6
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw border
      ctx.strokeStyle = barColor
      ctx.lineWidth = isSelected ? 2 : 1
      ctx.globalAlpha = 1
      ctx.strokeRect(x, y, barWidth, barHeight)

      // Draw class name
      ctx.save()
      ctx.translate(x + barWidth / 2, padding.top + chartHeight + 10)
      ctx.rotate(Math.PI / 4) // Rotate text for better fit
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.font = isSelected ? "bold 10px system-ui, sans-serif" : "10px system-ui, sans-serif"
      ctx.fillStyle = "#334155" // slate-700
      ctx.fillText(cls.name, 0, 0)
      ctx.restore()

      // Draw grade value
      ctx.fillStyle = "#334155" // slate-700
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      ctx.font = isSelected ? "bold 10px system-ui, sans-serif" : "10px system-ui, sans-serif"
      ctx.fillText(formatGrade(cls.current) + "%", x + barWidth / 2, y - 5)
    })

    // Draw title
    ctx.fillStyle = "#334155" // slate-700
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.font = "bold 12px system-ui, sans-serif"
    ctx.fillText("Class Grade Comparison", padding.left + chartWidth / 2, 15)
  }, [classes, selectedClassId, gradeBands, formatGrade])

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/9] w-full">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      <div className="text-sm text-muted-foreground">
        <p>
          This chart compares your current grades across all classes.
          {selectedClassId && "The highlighted bar represents the selected class."}
        </p>
      </div>
    </div>
  )
}
