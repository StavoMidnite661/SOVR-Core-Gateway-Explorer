import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.fallback) {
        return this.fallback;
      }
      return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-8 font-mono text-xs">
          <div className="max-w-md w-full border border-rose-500/50 bg-rose-500/5 p-6 rounded space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <span className="text-lg font-bold">SYSTEM_CRITICAL_FAILURE</span>
            </div>
            <p className="text-white/70 leading-relaxed">
              An unrecoverable runtime exception has occurred within the routing module. The authority link has been severed to prevent state drift.
            </p>
            <div className="bg-black/50 p-3 rounded border border-rose-500/20 text-rose-400 overflow-x-auto">
              <pre>{this.state.error?.message}</pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 bg-rose-500 text-white font-bold uppercase tracking-widest hover:bg-rose-600 transition-colors"
            >
              Attempt Hot-Reload
            </button>
          </div>
        </div>
      );
    }

    return this.children;
  }

  private get children() {
    return (this as any).props.children;
  }

  private get fallback() {
    return (this as any).props.fallback;
  }
}
