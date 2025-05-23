"use client"

import { useEffect, useRef, useState } from "react"
import { Label } from "@/components/ui/label"

type GradeBand = {
  label: string
  cutoff: number
  color: string
}

type GradeChartProps = {
  currentGrade: number
  finalWeight: number
  gradeBands: GradeBand[]
}

export default function GradeChart({ currentGrade, finalWeight, gradeBands }: Readonly<GradeChartProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Skip rendering during server-side rendering
    if (typeof window === 'undefined' || !mounted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Function to render the chart
    const renderChart = () => {
      // Set canvas dimensions with higher resolution for retina displays
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()

      // Always update the canvas dimensions to ensure proper rendering
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Skip rendering if dimensions are too small
      if (rect.width < 50 || rect.height < 50) return

      // Chart dimensions
      const padding = { top: 20, right: 30, bottom: 40, left: 50 }
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

      // X-axis labels (Final Exam Score)
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillStyle = "#64748b" // slate-500
      ctx.font = "10px system-ui, sans-serif"

      for (let i = 0; i <= 100; i += 20) {
        const x = padding.left + (i / 100) * chartWidth
        ctx.beginPath()
        ctx.moveTo(x, padding.top + chartHeight)
        ctx.lineTo(x, padding.top + chartHeight + 5)
        ctx.stroke()
        ctx.fillText(i.toString(), x, padding.top + chartHeight + 10)
      }

      // X-axis title
      ctx.font = "12px system-ui, sans-serif"
      ctx.fillText("Final Exam Score (%)", padding.left + chartWidth / 2, padding.top + chartHeight + 30)

      // Y-axis labels (Final Grade)
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"

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
      ctx.fillText("Final Grade (%)", 0, 0)
      ctx.restore()

      // Draw grade bands
      const sortedBands = [...gradeBands].sort((a, b) => a.cutoff - b.cutoff)

      for (let i = 0; i < sortedBands.length - 1; i++) {
        const band = sortedBands[i]
        const nextBand = sortedBands[i + 1]

        const y1 = padding.top + chartHeight - (band.cutoff / 100) * chartHeight
        const y2 = padding.top + chartHeight - (nextBand.cutoff / 100) * chartHeight

        // Extract color from Tailwind class
        let color = ""
        if (band.color.includes("emerald")) color = "#10b981"
        else if (band.color.includes("green")) color = "#22c55e"
        else if (band.color.includes("lime")) color = "#84cc16"
        else if (band.color.includes("yellow")) color = "#eab308"
        else if (band.color.includes("amber")) color = "#f59e0b"
        else if (band.color.includes("orange")) color = "#f97316"
        else if (band.color.includes("red")) color = "#ef4444"
        else color = "#3b82f6" // Default to blue

        ctx.fillStyle = color
        ctx.globalAlpha = 0.2
        ctx.fillRect(padding.left, y2, chartWidth, y1 - y2)

        // Add label
        ctx.globalAlpha = 1
        ctx.fillStyle = "#334155" // slate-700
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"
        ctx.font = "bold 10px system-ui, sans-serif"
        ctx.fillText(band.label, padding.left + chartWidth + 5, (y1 + y2) / 2)
      }

      // Calculate and draw the final grade line
      const w = finalWeight / 100
      ctx.beginPath()

      for (let x = 0; x <= 100; x++) {
        const finalGrade = currentGrade * (1 - w) + x * w
        const chartX = padding.left + (x / 100) * chartWidth
        const chartY = padding.top + chartHeight - (finalGrade / 100) * chartHeight

        if (x === 0) {
          ctx.moveTo(chartX, chartY)
        } else {
          ctx.lineTo(chartX, chartY)
        }
      }

      ctx.strokeStyle = "#3b82f6" // blue-500
      ctx.lineWidth = 2
      ctx.globalAlpha = 1
      ctx.stroke()

      // Draw current grade point
      const currentX = padding.left
      const currentY = padding.top + chartHeight - (currentGrade / 100) * chartHeight

      ctx.beginPath()
      ctx.arc(currentX, currentY, 5, 0, Math.PI * 2)
      ctx.fillStyle = "#3b82f6" // blue-500
      ctx.fill()

      // Add current grade label
      ctx.fillStyle = "#1e40af" // blue-800
      ctx.textAlign = "left"
      ctx.textBaseline = "bottom"
      ctx.font = "bold 12px system-ui, sans-serif"
      ctx.fillText(`Current: ${currentGrade.toFixed(1)}%`, currentX + 10, currentY - 5)

      // Draw target points for common scores
      const targetScores = [60, 70, 80, 90, 100]

      targetScores.forEach((score) => {
        const finalGrade = currentGrade * (1 - w) + score * w
        const targetX = padding.left + (score / 100) * chartWidth
        const targetY = padding.top + chartHeight - (finalGrade / 100) * chartHeight

        ctx.beginPath()
        ctx.arc(targetX, targetY, 4, 0, Math.PI * 2)
        ctx.fillStyle = "#64748b" // slate-500
        ctx.fill()

        // Add target score label
        ctx.fillStyle = "#334155" // slate-700
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        ctx.font = "10px system-ui, sans-serif"
        ctx.fillText(`${Math.round(finalGrade)}%`, targetX, targetY + 10)
      })
    }

    // Initial render
    renderChart()

    // Set up resize observer to handle window resizing
    const resizeObserver = new ResizeObserver(() => {
      renderChart()
    })

    resizeObserver.observe(canvas)

    // Also listen for window resize events
    const handleResize = () => {
      renderChart()
    }
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", handleResize)
    }
  }, [currentGrade, finalWeight, gradeBands, mounted])

  // Show a placeholder during SSR and hydration
  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm text-muted-foreground">Current Grade: {currentGrade.toFixed(1)}%</Label>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Final Weight: {finalWeight.toFixed(1)}%</Label>
          </div>
        </div>

        <div className="relative w-full h-[250px] bg-muted/20 animate-pulse rounded-md flex items-center justify-center">
          <p className="text-muted-foreground">Loading chart...</p>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            This chart shows how your final exam score will impact your overall grade.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm text-muted-foreground">Current Grade: {currentGrade.toFixed(1)}%</Label>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Final Weight: {finalWeight.toFixed(1)}%</Label>
        </div>
      </div>

      <div className="relative w-full h-full">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      <div className="text-sm text-muted-foreground">
        <p>
          This chart shows how your final exam score will impact your overall grade. The blue line represents your final
          grade based on different exam scores.
        </p>
      </div>
    </div>
  )
}
