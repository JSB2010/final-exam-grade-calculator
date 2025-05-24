"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Download, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function MobileOptimizations() {
  const { toast } = useToast()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Check if app is running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ??
        (window.navigator as any).standalone ??
        document.referrer.includes('android-app://')

      setIsStandalone(isStandaloneMode)
    }

    checkStandalone()

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show install prompt after a delay if not already installed
      setTimeout(() => {
        if (!isStandalone) {
          setShowInstallPrompt(true)
        }
      }, 5000)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      toast({
        title: "App Installed!",
        description: "Grade Calculator has been added to your home screen.",
      })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isStandalone, toast])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        toast({
          title: "Installing...",
          description: "Grade Calculator is being added to your home screen.",
        })
      }

      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('Error installing app:', error)
      toast({
        title: "Installation failed",
        description: "There was an error installing the app. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('installPromptDismissed', 'true')
    }
  }

  // Don't render on server side
  if (!isClient) {
    return null
  }

  // Don't show if already dismissed this session
  if (typeof window !== 'undefined' && sessionStorage.getItem('installPromptDismissed') === 'true') {
    return null
  }

  // Don't show if already installed or no prompt available
  if (isStandalone || !showInstallPrompt || !deferredPrompt) {
    return null
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 md:left-auto md:right-4 md:w-80">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Install App
              </h3>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Add Grade Calculator to your home screen for quick access and offline use.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-1" />
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
              >
                Not now
              </Button>
            </div>
          </div>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Component for mobile-specific touch optimizations
export function TouchOptimizations({ children }: { readonly children: React.ReactNode }) {
  const isMobile = useIsMobile()

  useEffect(() => {
    // Only run on client side and when isMobile is determined
    if (typeof window === 'undefined' || isMobile === undefined) return

    if (isMobile) {
      // Prevent zoom on double tap
      let lastTouchEnd = 0
      const preventZoom = (e: TouchEvent) => {
        const now = new Date().getTime()
        if (now - lastTouchEnd <= 300) {
          e.preventDefault()
        }
        lastTouchEnd = now
      }

      document.addEventListener('touchend', preventZoom, { passive: false })

      // Improve touch responsiveness
      document.body.style.touchAction = 'manipulation'

      return () => {
        document.removeEventListener('touchend', preventZoom)
        document.body.style.touchAction = 'auto'
      }
    }
  }, [isMobile])

  return <>{children}</>
}

// Component for sharing on mobile
export function MobileShare({ data, title }: { readonly data: any; readonly title: string }) {
  const [canShare, setCanShare] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setCanShare(!!navigator.share)
  }, [])

  const handleShare = async () => {
    if (!navigator.share) {
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support native sharing.",
        variant: "destructive",
      })
      return
    }

    try {
      await navigator.share({
        title: title,
        text: "Check out my grade calculator data!",
        url: window.location.href,
      })
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error)
        toast({
          title: "Sharing failed",
          description: "There was an error sharing your data.",
          variant: "destructive",
        })
      }
    }
  }

  if (!canShare) {
    return null
  }

  return (
    <Button onClick={handleShare} variant="outline" size="sm" className="flex items-center gap-2">
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  )
}
