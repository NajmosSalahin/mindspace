import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-deep flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-8 max-w-md w-full text-center space-y-4">
            <p className="text-5xl">⚠️</p>
            <h1 className="font-display text-2xl font-bold text-white">Something went wrong</h1>
            <p className="text-sm text-gray-500">An unexpected error occurred. Please try refreshing the page.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-medium"
              >
                Refresh Page
              </button>
              <Link to="/" className="px-6 py-2.5 rounded-xl text-sm font-medium bg-surface border border-border text-gray-400 hover:text-white transition">
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
