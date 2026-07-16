import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/shared/ui';

interface State { error: Error | null }

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State { return { error }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught application error', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="fatal-error">
        <AlertTriangle size={28} aria-hidden="true" />
        <h1>研究终端遇到未处理错误</h1>
        <p>{this.state.error.message}</p>
        <Button variant="primary" onClick={() => window.location.reload()}><RotateCw size={15} />重新载入</Button>
      </main>
    );
  }
}
