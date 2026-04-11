import { useState, useCallback, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'jobloom_low_data_mode';

export function useLowDataMode() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // localStorage unavailable
    }
  }, [enabled]);

  const toggle = useCallback(() => setEnabled(prev => !prev), []);

  const config = useMemo(
    () => ({
      enabled,
      pageSize: enabled ? 5 : 20,
      loadImages: !enabled,
    }),
    [enabled]
  );

  return { ...config, toggle };
}

export default useLowDataMode;
