import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
};

type State = { crashed: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { crashed: false };

  static getDerivedStateFromError(): State {
    return { crashed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.name ? ` "${this.props.name}"` : ""}] Uncaught error:`, error, info.componentStack);
  }

  render() {
    if (this.state.crashed) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
