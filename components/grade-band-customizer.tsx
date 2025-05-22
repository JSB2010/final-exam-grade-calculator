"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GradeBand } from "@/types/grade-calculator"
import { AlertCircle, Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface GradeBandCustomizerProps {
  gradeBands: GradeBand[]
  onChange: (bands: GradeBand[]) => void
  onReset: () => void
}

export function GradeBandCustomizer({ gradeBands, onChange, onReset }: GradeBandCustomizerProps) {
  const [bands, setBands] = useState<GradeBand[]>(gradeBands)
  const [hasError, setHasError] = useState(false)

  const colorOptions = [
    { name: "Blue", value: "bg-blue-500" },
    { name: "Green", value: "bg-green-500" },
    { name: "Emerald", value: "bg-emerald-500" },
    { name: "Lime", value: "bg-lime-500" },
    { name: "Yellow", value: "bg-yellow-500" },
    { name: "Amber", value: "bg-amber-500" },
    { name: "Orange", value: "bg-orange-500" },
    { name: "Red", value: "bg-red-500" },
    { name: "Purple", value: "bg-purple-500" },
    { name: "Pink", value: "bg-pink-500" },
  ]

  const handleChange = (index: number, field: keyof GradeBand, value: string | number) => {
    const newBands = [...bands]

    if (field === "cutoff") {
      newBands[index][field] = Number(value)
    } else {
      newBands[index][field] = value as string
    }

    // Sort bands by cutoff in descending order
    newBands.sort((a, b) => b.cutoff - a.cutoff)

    setBands(newBands)
    validateBands(newBands)
  }

  const validateBands = (bandsToValidate: GradeBand[]) => {
    // Check for duplicate labels
    const labels = bandsToValidate.map((band) => band.label)
    const hasDuplicateLabels = new Set(labels).size !== labels.length

    // Check for duplicate cutoffs
    const cutoffs = bandsToValidate.map((band) => band.cutoff)
    const hasDuplicateCutoffs = new Set(cutoffs).size !== cutoffs.length

    // Check for valid cutoff range
    const hasInvalidCutoffs = bandsToValidate.some((band) => band.cutoff < 0 || band.cutoff > 100)

    // Check if F grade has 0 cutoff
    const lowestBand = bandsToValidate[bandsToValidate.length - 1]
    const hasValidLowestBand = lowestBand && lowestBand.cutoff === 0

    setHasError(hasDuplicateLabels || hasDuplicateCutoffs || hasInvalidCutoffs || !hasValidLowestBand)

    return !hasDuplicateLabels && !hasDuplicateCutoffs && !hasInvalidCutoffs && hasValidLowestBand
  }

  const handleAddBand = () => {
    const newBand: GradeBand = {
      label: "New Grade",
      cutoff: 50,
      color: colorOptions[Math.floor(Math.random() * colorOptions.length)].value,
    }

    const newBands = [...bands, newBand]
    newBands.sort((a, b) => b.cutoff - a.cutoff)

    setBands(newBands)
    validateBands(newBands)
  }

  const handleRemoveBand = (index: number) => {
    const newBands = bands.filter((_, i) => i !== index)
    setBands(newBands)
    validateBands(newBands)
  }

  const handleSave = () => {
    if (validateBands(bands)) {
      onChange(bands)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Customize Grade Bands</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Please ensure all grade bands have unique labels and cutoffs between 0-100. The lowest grade must have a
              cutoff of 0.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {bands.map((band, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-4">
                <Label htmlFor={`band-label-${index}`} className="sr-only">
                  Grade Label
                </Label>
                <Input
                  id={`band-label-${index}`}
                  value={band.label}
                  onChange={(e) => handleChange(index, "label", e.target.value)}
                  placeholder="Label (e.g. A+)"
                  className="w-full"
                />
              </div>

              <div className="col-span-3">
                <Label htmlFor={`band-cutoff-${index}`} className="sr-only">
                  Cutoff
                </Label>
                <Input
                  id={`band-cutoff-${index}`}
                  type="number"
                  min="0"
                  max="100"
                  value={band.cutoff}
                  onChange={(e) => handleChange(index, "cutoff", e.target.value)}
                  placeholder="Cutoff %"
                  className="w-full"
                />
              </div>

              <div className="col-span-4">
                <Label htmlFor={`band-color-${index}`} className="sr-only">
                  Color
                </Label>
                <Select value={band.color} onValueChange={(value) => handleChange(index, "color", value)}>
                  <SelectTrigger id={`band-color-${index}`}>
                    <SelectValue placeholder="Color">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${band.color}`}></div>
                        <span>{colorOptions.find((c) => c.value === band.color)?.name || "Color"}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${color.value}`}></div>
                          <span>{color.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveBand(index)}
                  disabled={bands.length <= 2 || band.cutoff === 0}
                  aria-label="Remove grade band"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button type="button" variant="outline" onClick={handleAddBand} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Grade Band
        </Button>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onReset}>
          Reset to Default
        </Button>
        <Button onClick={handleSave} disabled={hasError}>
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  )
}
