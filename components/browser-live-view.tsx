"use client"

import { useState, useEffect } from "react"
import { X, ExternalLink, RefreshCw, Globe, Loader2, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BrowserLiveViewProps {
  sessionId: string | null
  liveViewUrl: string | null
  interactiveLiveViewUrl: string | null
  isLoading: boolean
  currentUrl?: string
  onClose: () => void
  onNavigate?: (url: string) => void
  className?: string
}

export function BrowserLiveView({
  sessionId,
  liveViewUrl,
  interactiveLiveViewUrl,
  isLoading,
  currentUrl,
  onClose,
  onNavigate,
  className,
}: BrowserLiveViewProps) {
  const [isInteractive, setIsInteractive] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [urlInput, setUrlInput] = useState(currentUrl || "")

  useEffect(() => {
    if (currentUrl) {
      setUrlInput(currentUrl)
    }
  }, [currentUrl])

  const viewUrl = isInteractive ? interactiveLiveViewUrl : liveViewUrl

  const handleNavigate = () => {
    if (urlInput && onNavigate) {
      let url = urlInput
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url
      }
      onNavigate(url)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNavigate()
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-background border border-border rounded-lg overflow-hidden",
        isFullscreen ? "fixed inset-4 z-50" : "h-full",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Browser Live View</span>
          {isLoading && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsInteractive(!isInteractive)}
            title={isInteractive ? "Switch to view-only" : "Switch to interactive"}
          >
            {isInteractive ? (
              <span className="text-xs font-medium text-green-500">Live</span>
            ) : (
              <span className="text-xs font-medium text-muted-foreground">View</span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          {viewUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => window.open(viewUrl, "_blank")}
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onClose}
            title="Close browser"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* URL Bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-background">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={handleNavigate}
          disabled={!urlInput || isLoading}
          title="Refresh/Navigate"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter URL to browse..."
          className="flex-1 h-7 px-2 text-sm bg-muted/50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative bg-muted/20">
        {!sessionId ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Globe className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-sm">No active browser session</p>
            <p className="text-xs mt-1">Start browsing to see the live view</p>
          </div>
        ) : isLoading && !viewUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Starting browser session...</p>
          </div>
        ) : viewUrl ? (
          <iframe
            src={viewUrl}
            className="w-full h-full border-0"
            title="Browser Live View"
            allow="clipboard-read; clipboard-write"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Globe className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-sm">Waiting for live view...</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        <span>
          {sessionId ? `Session: ${sessionId.slice(0, 8)}...` : "No session"}
        </span>
        <span className={cn(
          "flex items-center gap-1",
          isInteractive ? "text-green-500" : "text-muted-foreground"
        )}>
          <span className={cn(
            "w-2 h-2 rounded-full",
            sessionId ? (isInteractive ? "bg-green-500" : "bg-yellow-500") : "bg-red-500"
          )} />
          {sessionId ? (isInteractive ? "Interactive" : "View-only") : "Disconnected"}
        </span>
      </div>
    </div>
  )
}
