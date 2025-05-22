"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Ensure we're in the browser environment
    if (typeof window === "undefined") return

    const media = window.matchMedia(query)

    // Initial check
    setMatches(media.matches)

    // Setup listener for changes
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    // Modern browsers
    media.addEventListener("change", listener)

    // Cleanup
    return () => {
      media.removeEventListener("change", listener)
    }
  }, [query])

  return matches
}

// Predefined hooks for common breakpoints
export function useIsMobile() {
  return useMediaQuery("(max-width: 639px)")
}

export function useIsTablet() {
  return useMediaQuery("(min-width: 640px) and (max-width: 1023px)")
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)")
}

export function useIsLargeScreen() {
  return useMediaQuery("(min-width: 1280px)")
}

export function usePrefersDarkMode() {
  return useMediaQuery("(prefers-color-scheme: dark)")
}

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)")
}
