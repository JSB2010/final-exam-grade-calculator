"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { decodeShareData } from "@/utils/share-data"
import { serializeAppSettings, serializeGradeClasses } from "@/utils/storage-schemas"

type SharedImportProps = {
  encodedData?: string
}

export function SharedImport({ encodedData }: SharedImportProps) {
  const { toast } = useToast()
  const [imported, setImported] = useState(false)

  const payload = useMemo(() => {
    if (!encodedData) return null
    return decodeShareData(encodedData)
  }, [encodedData])

  const handleImport = () => {
    if (!payload) return
    try {
      localStorage.setItem("grade-calculator-classes", serializeGradeClasses(payload.classes))
      if (payload.settings) {
        localStorage.setItem("grade-calculator-settings", serializeAppSettings(payload.settings))
      }
      toast({
        title: "Data imported",
        description: "Your shared grades are ready in the calculator.",
      })
      setImported(true)
    } catch (error) {
      console.error("Failed to import shared data:", error)
      toast({
        title: "Import failed",
        description: "We couldn't import this share link. Please ask for a new link.",
        variant: "destructive",
      })
    }
  }

  if (!encodedData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No share data found</AlertTitle>
          <AlertDescription>Ask the sender for a share link that includes data.</AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button asChild>
            <Link href="/calculator">Go to calculator</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!payload) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Invalid share link</AlertTitle>
          <AlertDescription>The shared data could not be decoded. Please request a new link.</AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button asChild>
            <Link href="/calculator">Go to calculator</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Import Shared Grades</CardTitle>
          <CardDescription>
            This link contains grade data embedded in the URL. Importing will replace your current classes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{payload.classes.length} classes included</span>
            </div>
            <div className="mt-2 text-xs">
              {payload.settings ? "Settings are included in this share link." : "Settings are not included."}
            </div>
          </div>
          <div className="space-y-2">
            {payload.classes.slice(0, 6).map((cls) => (
              <div key={cls.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{cls.name}</span>
                <span className="text-muted-foreground">{cls.current.toFixed(1)}%</span>
              </div>
            ))}
            {payload.classes.length > 6 && (
              <div className="text-xs text-muted-foreground">
                And {payload.classes.length - 6} more classes.
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button onClick={handleImport} disabled={imported}>
            {imported ? "Imported" : "Import into calculator"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/calculator">{imported ? "Open calculator" : "Skip to calculator"}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
