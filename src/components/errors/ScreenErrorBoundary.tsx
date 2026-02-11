import type { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface ScreenErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

export function ScreenErrorBoundary({ children, onReset }: ScreenErrorBoundaryProps) {
  return (
    <ErrorBoundary level="screen" onReset={onReset}>
      {children}
    </ErrorBoundary>
  );
}
