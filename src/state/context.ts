import { createContext, useContext } from 'react';
import type { useDisplay } from '../hooks/useDisplay';
export const DisplayContext = createContext<ReturnType<typeof useDisplay> | null>(null);
export function useDisplayContext() {
  const context = useContext(DisplayContext);
  if (!context) throw new Error('DisplayProviderが必要です');
  return context;
}
