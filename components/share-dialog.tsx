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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Copy, Mail, Share2, CloudIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useGoogleAuth } from "@/hooks/use-google-auth" // Import the hook
import { exportToCloud } from "@/utils/cloud-export-utils"
import type { GradeClass } from "@/types/grade-calculator"

interface ShareDialogProps {
  data: {
    classes: GradeClass[]
    settings?: any
  }
  trigger?: React.ReactNode
}

export function ShareDialog({ data, trigger }: ShareDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("link")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("I wanted to share my grade calculator data with you.")
  const [includeSettings, setIncludeSettings] = useState(true)
  const [isSharing, setIsSharing] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [cloudService, setCloudService] = useState<'google-drive' | 'dropbox' | 'onedrive'>('google-drive')

  // Google Auth
  const {
    isSignedIn: isGoogleSignedIn,
    userProfile: googleUserProfile,
    signIn: googleSignIn,
    signOut: googleSignOut,
    gapiReady,
    gisReady,
    accessToken: googleAccessToken, // Get accessToken
    error: authError,
  } = useGoogleAuth();

  const handleGenerateLink = async () => {
    try {
      setIsSharing(true)

      // In a real implementation, this would create a shareable link by:
      // 1. Uploading the data to a server
      // 2. Generating a unique ID
      // 3. Creating a URL with that ID

      // For now, we'll simulate this with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000))

      const shareId = Math.random().toString(36).substring(2, 15)
      const generatedUrl = `${window.location.origin}/shared/${shareId}`

      setShareUrl(generatedUrl)

      toast({
        title: "Link generated",
        description: "Your shareable link has been created successfully.",
      })
    } catch (error) {
      console.error("Error generating link:", error)
      toast({
        title: "Link generation failed",
        description: "There was an error creating your shareable link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied",
        description: "The shareable link has been copied to your clipboard.",
      })
    }
  }

  const handleShareViaEmail = async () => {
    try {
      setIsSharing(true)

      // In a real implementation, this would:
      // 1. Upload the data to a server
      // 2. Send an email with a link to the data

      // For now, we'll simulate this with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Open the default email client
      const subject = "Grade Calculator Data"
      const body = `${message}\n\nView my grades here: ${shareUrl || "https://example.com/shared/demo"}`

      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

      toast({
        title: "Email prepared",
        description: "Your email client has been opened with the share information.",
      })

      setOpen(false)
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

  const handleCloudShare = async () => {
    if (cloudService === 'google-drive' && !isGoogleSignedIn) {
      toast({
        title: "Sign-in Required",
        description: "Please sign in with Google to export to Google Drive.",
        variant: "destructive",
      });
      return;
    }
    if (cloudService === 'google-drive' && (!gapiReady || !gisReady)) {
      toast({
        title: "Google API Not Ready",
        description: "Google services are still initializing. Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSharing(true)

      const exportData = {
        classes: data.classes,
        ...(includeSettings && data.settings ? { settings: data.settings } : {}),
      }

      const filename = `grade-calculator-export-${new Date().toISOString().slice(0, 10)}.json`

      const result = await exportToCloud({
        filename,
        data: exportData,
        service: cloudService,
        shareOptions: {
          email: email || undefined,
          message: message || undefined,
          public: false, // For Google Drive, actual sharing done by API if email provided
        },
        accessToken: cloudService === 'google-drive' ? googleAccessToken : undefined,
      });

      if (cloudService === 'google-drive' && typeof result === 'object' && result.webViewLink) {
        setShareUrl(result.webViewLink);
        toast({
          title: "Export Successful",
          description: `Successfully exported "${result.name}" to Google Drive.`,
          action: (
            <a href={result.webViewLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">View File</Button>
            </a>
          ),
        });
      } else if (typeof result === 'string') { // For other services (mocked)
        setShareUrl(result);
        toast({
          title: "Shared to cloud",
          description: `Your data has been exported to ${cloudService === 'dropbox' ? 'Dropbox' : 'OneDrive'}.`,
        });
      } else {
        throw new Error("Invalid response from cloud export.");
      }
    } catch (error: any) {
      console.error(`Error sharing to ${cloudService}:`, error);
      let description = "Failed to export data to the cloud. Please try again.";
      if (error.message) {
        description = error.message;
      }
      if (error.result && error.result.error && error.result.error.message) {
        description = `API Error: ${error.result.error.message}`;
      }
      
      toast({
        title: `${cloudService === 'google-drive' ? 'Google Drive' : cloudService} Export Failed`,
        description: description,
        variant: "destructive",
      });
      // Specific suggestion for auth errors
      if (error.message?.includes("token") || (error.result?.error?.code === 401 || error.result?.error?.code === 403) ) {
         toast({
          title: "Authentication Issue",
          description: "Please try signing out and signing back in to Google.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSharing(false)
    }
  }


  const isGoogleDriveSelected = cloudService === 'google-drive';
  const canExportToGoogleDrive = isGoogleDriveSelected && isGoogleSignedIn && gapiReady && gisReady;
  const canExportToOtherServices = !isGoogleDriveSelected; // Assuming other services don't need auth for now

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <DialogDescription>Share your grade calculator data via link, email, or cloud storage.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="link" className="flex items-center gap-1">
              <Copy className="h-4 w-4" />
              Link
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="cloud" className="flex items-center gap-1">
              <CloudIcon className="h-4 w-4" />
              Cloud
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-settings-link"
                  checked={includeSettings}
                  onCheckedChange={(checked) => setIncludeSettings(!!checked)}
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
                onCheckedChange={(checked) => setIncludeSettings(!!checked)}
              />
              <Label htmlFor="include-settings-email" className="cursor-pointer">
                Include settings in shared data
              </Label>
            </div>

            <Button onClick={handleShareViaEmail} disabled={isSharing || !email} className="w-full">
              {isSharing ? "Preparing Email..." : "Share via Email"}
            </Button>
          </TabsContent>

          <TabsContent value="cloud" className="space-y-4">
            {isGoogleDriveSelected && (
              <div className="p-3 border rounded-md bg-muted/30">
                {authError && (
                  <p className="text-sm text-destructive mb-2">
                    Auth Error: {authError.message}
                  </p>
                )}
                {!gapiReady || !gisReady && !authError && (
                   <p className="text-sm text-muted-foreground mb-2">
                    Initializing Google services... Please wait.
                  </p>
                )}
                {isGoogleSignedIn && googleUserProfile && (
                  <div className="space-y-2 mb-3">
                    <p className="text-sm font-medium">
                      Signed in as: {googleUserProfile.name || googleUserProfile.email}
                    </p>
                    <Button onClick={googleSignOut} variant="outline" size="sm">
                      Sign out from Google
                    </Button>
                  </div>
                )}
                {!isGoogleSignedIn && gapiReady && gisReady && (
                  <Button onClick={() => googleSignIn()} disabled={!gapiReady || !gisReady} className="w-full mb-2">
                    <CloudIcon className="h-4 w-4 mr-2" /> Sign in with Google
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Cloud Service</Label>
              <RadioGroup 
                value={cloudService} 
                onValueChange={(value) => {
                  setCloudService(value as any);
                  setShareUrl(""); // Clear previous share URL when service changes
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="google-drive" id="cloud-gdrive" />
                  <Label htmlFor="cloud-gdrive" className="flex items-center gap-2 cursor-pointer">
                    <CloudIcon className="h-4 w-4" /> Google Drive
                  </Label>
                </div>
                {/* Other cloud services - assuming they don't need auth for now */}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dropbox" id="cloud-dropbox" disabled={isGoogleDriveSelected && !isGoogleSignedIn} />
                  <Label htmlFor="cloud-dropbox" className={`flex items-center gap-2 cursor-pointer ${isGoogleDriveSelected && !isGoogleSignedIn ? 'text-muted-foreground' : ''}`}>
                    <CloudIcon className="h-4 w-4" /> Dropbox
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="onedrive" id="cloud-onedrive" disabled={isGoogleDriveSelected && !isGoogleSignedIn} />
                  <Label htmlFor="cloud-onedrive" className={`flex items-center gap-2 cursor-pointer ${isGoogleDriveSelected && !isGoogleSignedIn ? 'text-muted-foreground' : ''}`}>
                    <CloudIcon className="h-4 w-4" /> OneDrive
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-settings-cloud"
                checked={includeSettings}
                onCheckedChange={(checked) => setIncludeSettings(!!checked)}
                disabled={isGoogleDriveSelected && !isGoogleSignedIn}
              />
              <Label 
                htmlFor="include-settings-cloud" 
                className={`cursor-pointer ${isGoogleDriveSelected && !isGoogleSignedIn ? 'text-muted-foreground' : ''}`}
              >
                Include settings in shared data
              </Label>
            </div>

            <Button
              onClick={handleCloudShare}
              disabled={
                isSharing ||
                (isGoogleDriveSelected && (!isGoogleSignedIn || !gapiReady || !gisReady || !googleAccessToken))
              }
              className="w-full"
            >
              {isSharing 
                ? `Exporting to ${cloudService === 'google-drive' ? 'Google Drive' : cloudService}...` 
                : `Export to ${cloudService === 'google-drive' ? 'Google Drive' : cloudService === 'dropbox' ? 'Dropbox' : 'OneDrive'}`}
            </Button>

            {shareUrl && activeTab === 'cloud' && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="cloud-url">
                  {cloudService === 'google-drive' ? 'Google Drive File Link' : 'Cloud Link'}
                </Label>
                <div className="flex gap-2">
                  <Input id="cloud-url" value={shareUrl} readOnly className="flex-1" />
                  <Button onClick={handleCopyLink} size="sm" aria-label="Copy cloud link">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
