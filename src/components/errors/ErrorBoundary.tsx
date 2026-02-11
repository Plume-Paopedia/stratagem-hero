import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Button } from '../ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  level?: 'global' | 'screen';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary ${this.props.level ?? 'screen'}]`, error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const isGlobal = this.props.level === 'global';

      return (
        <div className="flex flex-col items-center justify-center gap-6 p-8 h-full text-center">
          <div className="text-5xl">&#x26A0;</div>
          <h2 className="font-display text-2xl text-hd-red uppercase tracking-widest">
            {isGlobal ? 'Defaillance Systeme Critique' : 'Dysfonctionnement de Secteur'}
          </h2>
          <p className="font-heading text-sm text-hd-gray max-w-md">
            {isGlobal
              ? 'Le Commandement de Super Terre a perdu le contact. Reinitialisez les systemes pour reprendre les operations.'
              : 'Ce secteur a rencontre une erreur. Retournez a la base ou tentez une recuperation.'}
          </p>
          {this.state.error && (
            <pre className="text-xs text-hd-gray/50 bg-hd-dark border border-hd-border rounded p-3 max-w-lg overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3">
            <Button variant="primary" size="md" onClick={this.handleReset}>
              {isGlobal ? 'Reinitialiser' : 'Retour a la Base'}
            </Button>
            {isGlobal && (
              <Button variant="secondary" size="md" onClick={() => window.location.reload()}>
                Redemarrage Complet
              </Button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
