import { useState, useEffect } from "react";

/**
 * Hook untuk mendebounce nilai (misalnya query pencarian)
 * Menyertakan status isDebouncing untuk menampilkan loading indicator halus pada UI.
 */
export function useDebounce<T>(value: T, delay: number = 400): { debouncedValue: T; isDebouncing: boolean } {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);

  useEffect(() => {
    if (value === debouncedValue) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay, debouncedValue]);

  return { debouncedValue, isDebouncing };
}
