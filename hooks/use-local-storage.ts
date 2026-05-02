"use client"

import { useState, useEffect, useCallback, useRef } from "react"

type LocalStorageOptions<T> = {
  parse?: (value: unknown, fallback: T) => T
  serialize?: (value: T) => string
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: LocalStorageOptions<T>,
): [T, (value: T) => void] {
  // Create a state variable to track if we're mounted
  const [mounted, setMounted] = useState(false)

  // Use a ref to track the current value to avoid dependency issues
  const valueRef = useRef<T>(initialValue)
  const initialValueRef = useRef<T>(initialValue)
  const optionsRef = useRef<LocalStorageOptions<T> | undefined>(options)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const parseValue = useCallback((value: unknown) => {
    const parser = optionsRef.current?.parse
    return parser ? parser(value, initialValueRef.current) : (value as T)
  }, [])

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Set up the initial value when the component mounts
  useEffect(() => {
    setMounted(true)
    try {
      // Get from local storage by key
      const item = localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      const parsedItem = item ? JSON.parse(item) : initialValueRef.current
      const normalizedItem = parseValue(parsedItem)

      // Only update state if the value is different
      if (JSON.stringify(normalizedItem) !== JSON.stringify(valueRef.current)) {
        setStoredValue(normalizedItem)
        valueRef.current = normalizedItem
      }
    } catch (error) {
      // If error also return initialValue
      console.error("Error reading from localStorage:", error)
      setStoredValue(initialValueRef.current)
      valueRef.current = initialValueRef.current
    }
  }, [key, parseValue]) // Remove initialValue from dependencies to prevent re-renders

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
          const serializer = optionsRef.current?.serialize
          const serializedValue = serializer ? serializer(valueToStore) : JSON.stringify(valueToStore)
          localStorage.setItem(key, serializedValue)
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
          const rawValue = JSON.parse(e.newValue)
          const parsedValue = parseValue(rawValue)
          if (JSON.stringify(parsedValue) !== JSON.stringify(valueRef.current)) {
            setStoredValue(parsedValue)
            valueRef.current = parsedValue
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
  }, [key, mounted, parseValue])

  return [storedValue, setValue]
}
