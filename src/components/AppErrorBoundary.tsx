import { AlertTriangle, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { Component } from "react";
import { useI18n } from "../i18n";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryInnerProps extends AppErrorBoundaryProps {
  messages: {
    renderErrorBadge: string;
    renderErrorTitle: string;
    renderErrorDescription: string;
    errorDetail: string;
    recoverReload: string;
  };
}

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AppErrorBoundaryInner extends Component<
  AppErrorBoundaryInnerProps,
  AppErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryInnerProps) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || "Rendering error",
    };
  }

  componentDidCatch(error: Error) {
    console.error("AppErrorBoundary", error);
  }

  private handleRecovery = () => {
    try {
      window.localStorage.removeItem("myhealthhub.skinfolds");
      window.localStorage.removeItem("myhealthhub.circumferences");
      window.localStorage.removeItem("myhealthhub.bia");
    } catch {
      // Ignore storage errors and still attempt reload.
    }

    window.location.reload();
  };

  render() {
    const { messages } = this.props;

    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4">
        <div className="w-full rounded-2xl border border-rose-800/60 bg-slate-950/90 p-6 text-slate-100 shadow-panel">
          <p className="inline-flex items-center gap-2 rounded-full border border-rose-700/60 bg-rose-900/20 px-3 py-1 text-xs uppercase tracking-wide text-rose-200">
            <AlertTriangle className="h-4 w-4" />
            {messages.renderErrorBadge}
          </p>
          <h1 className="mt-3 font-display text-2xl font-semibold">
            {messages.renderErrorTitle}
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            {messages.renderErrorDescription}
          </p>
          <p className="mt-3 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
            {messages.errorDetail}: {this.state.message}
          </p>
          <button
            type="button"
            onClick={this.handleRecovery}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan-700/60 bg-cyan-900/30 px-4 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-900/45"
          >
            <RefreshCw className="h-4 w-4" />
            {messages.recoverReload}
          </button>
        </div>
      </div>
    );
  }
}

export const AppErrorBoundary = ({ children }: AppErrorBoundaryProps) => {
  const { m } = useI18n();

  return <AppErrorBoundaryInner messages={m}>{children}</AppErrorBoundaryInner>;
};
