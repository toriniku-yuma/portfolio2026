import type { ReactNode } from 'react';
import { DisplayContext } from './context';
import { useDisplay } from '../hooks/useDisplay';
export default function DisplayProvider({ children }: { children: ReactNode }) {
  const value = useDisplay();
  return (
    <DisplayContext value={value}>
      <div onClick={value.navigate}>{children}</div>
    </DisplayContext>
  );
}
