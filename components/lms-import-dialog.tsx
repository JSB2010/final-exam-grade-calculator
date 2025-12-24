"use client"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CloudDownload } from "lucide-react"
import type { GradeClass } from "@/types/grade-calculator"
import { useToast } from "@/hooks/use-toast"

interface LmsImportDialogProps {
  onImport: (classes: GradeClass[]) => void
  trigger?: React.ReactNode
}

/**
 * Render a dialog that lets users connect to a Canvas LMS and import class data.
 *
 * The dialog provides controls to choose a predefined school or enter a custom Canvas URL,
 * supply an API token, and initiate the import. On successful import the component invokes
 * the `onImport` callback with the array of imported classes and displays a success toast;
 * on failure it displays an error toast.
 *
 * @param onImport - Callback invoked with the imported array of `GradeClass` objects after a successful import
 * @param trigger - Optional React node to use as the dialog trigger; if omitted a default button is rendered
 * @returns The dialog component that manages LMS connection and import UI
 */
export function LmsImportDialog({ onImport, trigger }: LmsImportDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const schools = [
    { value: "kds", label: "Kent Denver School", url: "https://kentdenver.instructure.com" },
    { value: "custom", label: "Custom Canvas URL" },
  ]

  const [school, setSchool] = useState<string>("kds")
  const [baseUrl, setBaseUrl] = useState<string>(schools[0].url)
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)

  const handleImport = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/lms/canvas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, baseUrl }),
      })
      if (!res.ok) {
        const errorDetails = `HTTP ${res.status} - ${res.statusText}`;
        throw new Error(`Request failed: ${errorDetails}`);
      }
      const data = await res.json();
      if (Array.isArray(data.classes)) {
        onImport(data.classes as GradeClass[]);
        toast({
          title: "Import successful",
          description: "Data imported from your LMS.",
        });
        setOpen(false);
      } else {
        throw new Error("Invalid response: Expected an array of classes.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast({
        title: "Import failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <CloudDownload className="w-4 h-4 mr-1" />
            Import from LMS
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import from LMS</DialogTitle>
          <DialogDescription>
            Connect to your learning management system and import your classes.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="school">School</Label>
            <Select value={school} onValueChange={(v) => {
              setSchool(v)
              if (v === "kds") setBaseUrl(schools[0].url)
            }}>
              <SelectTrigger id="school">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {schools.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {school === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="url">Canvas URL</Label>
              <Input id="url" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://school.instructure.com" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="token">API Token</Label>
            <Input id="token" value={token} onChange={e => setToken(e.target.value)} />
          </div>
          <p className="text-sm text-muted-foreground">
            Generate a token in Canvas under <strong>Account → Settings → New Access Token</strong>.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleImport} disabled={loading}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}