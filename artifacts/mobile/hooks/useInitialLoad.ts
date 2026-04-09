import { useEffect, useState } from "react";

export function useInitialLoad(delay = 700): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
  }, []);
  return loading;
}
