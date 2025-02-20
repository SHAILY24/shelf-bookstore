import { useState, useEffect } from 'react';

// Custom hook to debounce a value
// T is the type of the value being debounced
export function useDebounce<T>(value: T, delay: number): T {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Return a cleanup function that will run when:
    // - The component unmounts
    // - The effect runs again (either value or delay changes)
    return () => {
      clearTimeout(handler);
    };
  }, [
    value, // Only re-call effect if value changes
    delay, // Or if delay changes
  ]);

  return debouncedValue;
} 