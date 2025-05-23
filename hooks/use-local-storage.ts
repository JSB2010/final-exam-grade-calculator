"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Create a state variable to track if we're mounted
  const [mounted, setMounted] = useState(false)

  // Use a ref to track the current value to avoid dependency issues
  const valueRef = useRef<T>(initialValue)

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Set up the initial value when the component mounts
  useEffect(() => {
    setMounted(true)
    try {
      // Get from local storage by key
      const item = localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      const parsedItem = item ? JSON.parse(item) : initialValue

      // Only update state if the value is different
      if (JSON.stringify(parsedItem) !== JSON.stringify(valueRef.current)) {
        setStoredValue(parsedItem)
        valueRef.current = parsedItem
      }
    } catch (error) {
      // If error also return initialValue
      console.error("Error reading from localStorage:", error)
      setStoredValue(initialValue)
      valueRef.current = initialValue
    }
  }, [key]) // Remove initialValue from dependencies to prevent re-renders

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback((value: T) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(valueRef.current) : value

      // Only update if the value is different
      if (JSON.stringify(valueToStore) !== JSON.stringify(valueRef.current)) {
        // Save state
        setStoredValue(valueToStore)
        valueRef.current = valueToStore

        // Save to local storage
        if (mounted) {
          localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error("Error writing to localStorage:", error)
    }
  }, [key, mounted])

  // Listen for changes to this local storage key in other tabs/windows
  useEffect(() => {
    if (!mounted) return

    function handleStorageChange(e: StorageEvent) {
      if (e.key === key && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue)
          if (JSON.stringify(newValue) !== JSON.stringify(valueRef.current)) {
            setStoredValue(newValue)
            valueRef.current = newValue
          }
        } catch (error) {
          console.error("Error parsing localStorage change:", error)
        }
      }
    }

    // Add event listener
    window.addEventListener("storage", handleStorageChange)

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [key, mounted])

  return [storedValue, setValue]
}
