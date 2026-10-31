import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useT } from '@/i18n';
import { ErrorState } from './ui/Feedback';

function CrashState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const t = useT();
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <ErrorState title={t('common.crashed')} error={error} onRetry={onRetry} />
    </div>
  );
}

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error) => void;
  resetKey?: unknown;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[3D Code World] UI error', error, info.componentStack);
    this.props.onError?.(error);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return this.props.fallback ? (
        this.props.fallback(this.state.error, this.reset)
      ) : (
        <CrashState error={this.state.error} onRetry={this.reset} />
      );
    }
    return this.props.children;
  }
}
