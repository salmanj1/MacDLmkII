import { Component, type ErrorInfo, type ReactNode } from 'react';
import styles from './ErrorBoundary.module.less';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

/**
 * Catches render errors and shows a gentle fallback so the UI stays usable.
 * Keeps the reset simple (full reload) to avoid partially broken state.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI error boundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.fallback} role="alert">
          <div className={styles.title}>{this.props.fallbackTitle ?? 'Something went wrong.'}</div>
          <div>{this.props.fallbackMessage ?? 'Please reload to continue.'}</div>
          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={this.handleReset}>
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
