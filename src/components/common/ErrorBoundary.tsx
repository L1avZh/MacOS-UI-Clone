import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  appName: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Contains a crash inside one app's window instead of taking down the whole desktop. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[${this.props.appName}] crashed:`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: 24,
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          <strong>{this.props.appName} had a problem and couldn&rsquo;t continue.</strong>
          <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
            Close this window and reopen the app to try again.
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}
