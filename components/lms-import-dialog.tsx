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
  const provider = "canvas"
  const [school, setSchool] = useState("kds")
  const [baseUrl, setBaseUrl] = useState("https://kentdenver.instructure.com")
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)

  const handleImport = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/lms/${provider}`, {
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
            <Select value={school} onValueChange={value => {
              setSchool(value)
              if (value === "kds") {
                setBaseUrl("https://kentdenver.instructure.com")
              }
            }}>
              <SelectTrigger id="school">
                <SelectValue placeholder="Select your school" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kds">Kent Denver School</SelectItem>
                <SelectItem value="custom">Custom Canvas URL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {school === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="baseUrl">Canvas URL</Label>
              <Input
                id="baseUrl"
                placeholder="https://example.instructure.com"
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="token">Access Token</Label>
            <Input
              id="token"
              value={token}
              onChange={e => setToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              In Canvas, go to <strong>Account &gt; Settings</strong>, then choose
              <em>New Access Token</em>.
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
