import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#ECE7DE] text-[#141210] flex items-center justify-center p-6 selection:bg-[#DDD6C8]">
          <div className="w-full max-w-lg bg-[#ECE7DE] border border-[#141210]/25 rounded-[2px] p-8 sm:p-10 shadow-xl text-center space-y-6">
            <div className="w-12 h-12 rounded-[2px] border border-[#B23A2E]/30 bg-[#B23A2E]/10 text-[#B23A2E] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 stroke-[1.75]" />
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-medium uppercase tracking-widest text-[#141210]/60">
                Barber &amp; Co. — Estado del Sistema
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#141210] tracking-tight">
                Ocurrió un error inesperado
              </h1>
              <p className="text-xs sm:text-sm text-[#141210]/70 leading-relaxed pt-1">
                La aplicación ha experimentado una interrupción imprevista. Los datos guardados previamente permanecen seguros en su dispositivo.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-[#DDD6C8]/40 border border-[#141210]/15 rounded-[2px] p-3 text-[11px] font-mono text-[#141210]/75 overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4 stroke-[2]" />
                <span>Reiniciar aplicación</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
