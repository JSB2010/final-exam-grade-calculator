"use client"

import { useEffect, useRef } from "react"

type GradeBand = {
  label: string
  cutoff: number
  color: string
}

type TargetGrade = {
  label: string
  cutoff: number
  required: number
  color: string
}

type GradeDistributionProps = {
  currentGrade: number
  targetGrade: TargetGrade | null
  gradeBands: GradeBand[]
}

export default function GradeDistribution({ currentGrade, targetGrade, gradeBands }: GradeDistributionProps) {
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
    const padding = { top: 20, right: 20, bottom: 40, left: 20 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom
    const barWidth = chartWidth / gradeBands.length

    // Sort grade bands from highest to lowest
    const sortedBands = [...gradeBands].sort((a, b) => b.cutoff - a.cutoff)

    // Draw bars
    sortedBands.forEach((band, index) => {
      const x = padding.left + index * barWidth
      const barHeight = chartHeight * 0.7 // Fixed height for all bars
      const y = padding.top + (chartHeight - barHeight)

      // Draw bar
      ctx.fillStyle = band.color.replace("bg-", "").replace("-500", "").replace("-400", "")
      ctx.globalAlpha = 0.7
      ctx.fillRect(x, y, barWidth - 4, barHeight)

      // Draw border
      ctx.strokeStyle = band.color.replace("bg-", "").replace("-500", "").replace("-400", "")
      ctx.lineWidth = 1
      ctx.globalAlpha = 1
      ctx.strokeRect(x, y, barWidth - 4, barHeight)

      // Draw label
      ctx.fillStyle = "#334155" // slate-700
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.font = "bold 12px system-ui, sans-serif"
      ctx.fillText(band.label, x + (barWidth - 4) / 2, y + barHeight + 5)

      // Draw cutoff
      ctx.font = "10px system-ui, sans-serif"
      ctx.fillStyle = "#64748b" // slate-500
      ctx.fillText(`${band.cutoff}%`, x + (barWidth - 4) / 2, y + barHeight + 20)
    })

    // Highlight current grade
    const currentBandIndex = sortedBands.findIndex((band) => currentGrade >= band.cutoff)
    if (currentBandIndex !== -1) {
      const x = padding.left + currentBandIndex * barWidth
      const barHeight = chartHeight * 0.7
      const y = padding.top + (chartHeight - barHeight)

      // Highlight current grade band
      ctx.fillStyle = "#3b82f6" // blue-500
      ctx.globalAlpha = 0.3
      ctx.fillRect(x, y, barWidth - 4, barHeight)

      // Draw marker
      ctx.beginPath()
      ctx.moveTo(x + (barWidth - 4) / 2, y - 15)
      ctx.lineTo(x + (barWidth - 4) / 2 - 8, y - 5)
      ctx.lineTo(x + (barWidth - 4) / 2 + 8, y - 5)
      ctx.closePath()
      ctx.fillStyle = "#3b82f6" // blue-500
      ctx.globalAlpha = 1
      ctx.fill()

      // Draw current grade text
      ctx.fillStyle = "#1e40af" // blue-800
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.font = "bold 10px system-ui, sans-serif"
      ctx.fillText("Current", x + (barWidth - 4) / 2, y - 25)
      ctx.font = "bold 12px system-ui, sans-serif"
      ctx.fillText(`${currentGrade}%`, x + (barWidth - 4) / 2, y - 10)
    }

    // Highlight target grade if available
    if (targetGrade) {
      const targetBandIndex = sortedBands.findIndex((band) => band.label === targetGrade.label)
      if (targetBandIndex !== -1) {
        const x = padding.left + targetBandIndex * barWidth
        const barHeight = chartHeight * 0.7
        const y = padding.top + (chartHeight - barHeight)

        // Draw target outline
        ctx.strokeStyle = "#f97316" // orange-500
        ctx.lineWidth = 2
        ctx.globalAlpha = 1
        ctx.strokeRect(x - 2, y - 2, barWidth, barHeight + 4)

        // Draw target marker
        ctx.beginPath()
        ctx.moveTo(x + (barWidth - 4) / 2, y - 15)
        ctx.lineTo(x + (barWidth - 4) / 2 - 8, y - 5)
        ctx.lineTo(x + (barWidth - 4) / 2 + 8, y - 5)
        ctx.closePath()
        ctx.fillStyle = "#f97316" // orange-500
        ctx.fill()

        // Draw target grade text
        ctx.fillStyle = "#9a3412" // orange-800
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.font = "bold 10px system-ui, sans-serif"
        ctx.fillText("Target", x + (barWidth - 4) / 2, y - 25)
        ctx.font = "bold 12px system-ui, sans-serif"
        ctx.fillText(targetGrade.label, x + (barWidth - 4) / 2, y - 10)
      }
    }
  }, [currentGrade, targetGrade, gradeBands])

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/9] w-full">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      <div className="text-sm text-muted-foreground">
        <p>
          This chart shows the grade distribution and where your current grade falls.{" "}
          {targetGrade ? "Your target grade is highlighted in orange." : ""}
        </p>
      </div>
    </div>
  )
}
