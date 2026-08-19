import { useEffect, useState } from "react";

// Delays updating the returned value until `value` has stopped changing
// for `delayMs`. Use this to avoid re-filtering/re-fetching on every
// keystroke — pass the raw input straight to the controlled <input> so
// typing stays instant, and only feed the debounced value into whatever
// expensive work (filtering, API calls) reacts to it.
const useDebounce = (value, delayMs = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};

export default useDebounce;
