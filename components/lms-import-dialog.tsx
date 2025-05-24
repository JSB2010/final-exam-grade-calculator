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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CloudDownload } from "lucide-react"
import type { GradeClass } from "@/types/grade-calculator"
import { useToast } from "@/hooks/use-toast"

interface LmsImportDialogProps {
  onImport: (classes: GradeClass[]) => void
  trigger?: React.ReactNode
}

export function LmsImportDialog({ onImport, trigger }: LmsImportDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [school, setSchool] = useState("kent")
  const [customUrl, setCustomUrl] = useState("")
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)

  const handleImport = async () => {
    try {
      setLoading(true)
      const baseUrl =
        school === "kent"
          ? "https://kentdenver.instructure.com"
          : customUrl
      const res = await fetch(`/api/lms/canvas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, baseUrl }),
      })
      if (!res.ok) throw new Error("Request failed")
      const data = await res.json()
      if (Array.isArray(data.classes)) {
        onImport(data.classes as GradeClass[])
        toast({
          title: "Import successful",
          description: "Data imported from your LMS.",
        })
        setOpen(false)
      } else {
        throw new Error("Invalid response")
      }
    } catch (err) {
      toast({
        title: "Import failed",
        description: "Unable to import data from LMS.",
        variant: "destructive",
      })
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
            <Select value={school} onValueChange={setSchool}>
              <SelectTrigger id="school">
                <SelectValue placeholder="Select a school" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kent">Kent Denver School</SelectItem>
                <SelectItem value="custom">Custom Canvas URL</SelectItem>
              </SelectContent>
            </Select>
            {school === "custom" && (
              <Input
                id="custom-url"
                placeholder="https://your.school.instructure.com"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="token">API Token</Label>
            <Input id="token" value={token} onChange={e => setToken(e.target.value)} />
            <p className="text-sm text-muted-foreground">
              Log in to Canvas &gt; Account &gt; Settings &gt; New Access Token.
            </p>
          </div>
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
