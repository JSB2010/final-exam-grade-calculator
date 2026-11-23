"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { decodeShareData, readShareDataFromLocation } from "@/utils/share-data"
import { parseGradeClasses, serializeAppSettings, serializeGradeClasses } from "@/utils/storage-schemas"

export function SharedImport() {
  const { toast } = useToast()
  const [imported, setImported] = useState(false)
  const [encodedData, setEncodedData] = useState<string | null>()
  const [applySettings, setApplySettings] = useState(false)

  useEffect(() => {
    const read = () => {
      setEncodedData(readShareDataFromLocation(window.location))
      setImported(false)
      setApplySettings(false)
    }
    read()
    window.addEventListener("hashchange", read)
    return () => window.removeEventListener("hashchange", read)
  }, [])

  const payload = useMemo(() => {
    if (!encodedData) return null
    return decodeShareData(encodedData)
  }, [encodedData])

  const handleImport = () => {
    if (!payload || imported) return
    try {
      const key = "grade-calculator-classes"
      const previous = localStorage.getItem(key)
      const existing = previous === null ? [] : parseGradeClasses(JSON.parse(previous), [])
      if (previous !== null && !existing.length) {
        // An empty list is valid, but don't overwrite an unrecognized saved format.
        const raw = JSON.parse(previous)
        if (!Array.isArray(raw) && !(raw?.version === 1 && Array.isArray(raw.data))) {
          throw new Error("Unrecognized local grade data")
        }
        if ((Array.isArray(raw) ? raw : raw.data).length) throw new Error("Invalid local grade data")
      }
      const added = payload.classes.map(({ source, canvasCourseId, canvasCourseUrl, lastSyncedAt, ...cls }) => ({
        ...cls, id: crypto.randomUUID(),
      }))
      localStorage.setItem(key, serializeGradeClasses([...existing, ...added]))
      if (payload.settings && applySettings) {
        try {
          localStorage.setItem("grade-calculator-settings", serializeAppSettings(payload.settings))
        } catch {
          setImported(true)
          toast({ title: "Classes imported", description: "Browser storage couldn't save the shared settings." })
          return
        }
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
        description: "Your classes weren’t changed. Check that browser storage is available and try again.",
        variant: "destructive",
      })
    }
  }

  if (encodedData === undefined) {
    return <p className="container mx-auto px-4 py-12" role="status">Loading shared grades…</p>
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
            This link contains grade data. Importing adds copies without replacing saved classes.
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
          {payload.settings && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={applySettings} disabled={imported} onChange={(event) => setApplySettings(event.target.checked)} />
              Also apply the shared calculator settings
            </label>
          )}
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
            {imported ? "Imported" : "Add to calculator"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/calculator">{imported ? "Open calculator" : "Skip to calculator"}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
