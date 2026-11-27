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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, Mail, Share2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { AppSettings, GradeClass } from "@/types/grade-calculator"
import { buildSharePayload, encodeShareData } from "@/utils/share-data"

interface ShareDialogProps {
  data: {
    classes: GradeClass[]
    settings?: AppSettings
  }
  trigger?: React.ReactNode
}

export function ShareDialog({ data, trigger }: ShareDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("link")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("I wanted to share my grade calculator data with you.")
  const [includeSettings, setIncludeSettings] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const handleSettingsChange = (checked: boolean) => {
    setIncludeSettings(checked)
    setShareUrl("")
  }

  const buildShareUrl = () => {
    const payload = buildSharePayload({
      classes: data.classes,
      ...(includeSettings && data.settings ? { settings: data.settings } : {}),
    })
    const encoded = encodeShareData(payload)
    return `${window.location.origin}/shared#data=${encoded}`
  }

  const handleGenerateLink = async () => {
    try {
      setIsSharing(true)
      const generatedUrl = buildShareUrl()
      setShareUrl(generatedUrl)

      toast({
        title: "Link generated",
        description: "Your shareable link has been created successfully.",
      })
    } catch (error) {
      console.error("Error generating link:", error)
      toast({
        title: "Link generation failed",
        description: error instanceof Error ? error.message : "Try exporting your grades as a file.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({ title: "Link copied" })
    } catch {
      toast({ title: "Copy unavailable", description: "Select and copy the link manually." })
    }
  }

  const handleShareViaEmail = async () => {
    try {
      setIsSharing(true)

      // Open the default email client
      const subject = "Grade Calculator Data"
      const generatedUrl = buildShareUrl()
      const body = `${message}\n\nView my grades here: ${generatedUrl}`

      window.location.href = `mailto:${encodeURIComponent(email.trim()).replace(/%40/g, "@")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

      toast({
        title: "Email prepared",
        description: "Your email client has been opened with the share information.",
      })

      setOpen(false)
      setShareUrl("")
    } catch (error) {
      console.error("Error sharing via email:", error)
      toast({
        title: "Email sharing failed",
        description: "There was an error preparing your email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setShareUrl("") }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Grade Data</DialogTitle>
          <DialogDescription>Share a snapshot with a link or through your email app.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="link" className="flex items-center gap-1">
              <Copy className="h-4 w-4" />
              Link
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Anyone with the link can read your class names and grades. Assignment details and Canvas identifiers are not included.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-settings-link"
                  checked={includeSettings}
                  onCheckedChange={(checked) => handleSettingsChange(!!checked)}
                />
                <Label htmlFor="include-settings-link" className="cursor-pointer">
                  Include settings in shared data
                </Label>
              </div>
            </div>

            {shareUrl ? (
              <div className="space-y-2">
                <Label htmlFor="share-url">Shareable Link</Label>
                <div className="flex gap-2">
                  <Input id="share-url" value={shareUrl} readOnly className="flex-1" />
                  <Button onClick={handleCopyLink} size="sm" aria-label="Copy shareable link">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={handleGenerateLink} disabled={isSharing} className="w-full">
                {isSharing ? "Generating..." : "Generate Shareable Link"}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <p className="text-xs text-muted-foreground">
              This opens your email app. Anyone with the link can read the class names and grades.
            </p>
            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-settings-email"
                checked={includeSettings}
                onCheckedChange={(checked) => handleSettingsChange(!!checked)}
              />
              <Label htmlFor="include-settings-email" className="cursor-pointer">
                Include settings in shared data
              </Label>
            </div>

            <Button onClick={handleShareViaEmail} disabled={isSharing || !email} className="w-full">
              {isSharing ? "Preparing Email..." : "Share via Email"}
            </Button>
          </TabsContent>

        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => { setOpen(false); setShareUrl("") }}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
