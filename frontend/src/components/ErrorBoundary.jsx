import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
  }

  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return <DefaultFallback error={this.state.error} onReset={this.reset} />;
  }
}

function DefaultFallback({ error, onReset }) {
  return (
    <>
      <style>{STYLES}</style>
      <div className="eb-overlay">
        <div className="eb-card">
          <div className="eb-icon-wrap">
            <svg
              className="eb-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h1 className="eb-title">Something went wrong</h1>
          <p className="eb-subtitle">
            An unexpected error occurred in this part of the app.
          </p>

          {error && (
            <details className="eb-details">
              <summary className="eb-summary">Show error details</summary>
              <pre className="eb-pre">{error.toString()}</pre>
            </details>
          )}

          <div className="eb-actions">
            <button className="eb-btn-primary" onClick={onReset}>
              Try again
            </button>
            <button
              className="eb-btn-secondary"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Scoped styles ───────────────────────────────────────────────────────────

const STYLES = `
  .eb-overlay {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0d0d0f;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .eb-card {
    background: #18181b;
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 1rem;
    padding: 2.5rem 2rem;
    max-width: 440px;
    width: 100%;
    text-align: center;
    box-shadow:
      0 0 0 1px rgba(239,68,68,0.06),
      0 8px 40px rgba(0,0,0,0.5);
    animation: eb-fadeUp 0.35s ease forwards;
  }

  @keyframes eb-fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .eb-icon-wrap {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.25rem;
  }

  .eb-icon {
    width: 26px;
    height: 26px;
    color: #ef4444;
  }

  .eb-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #f4f4f5;
    margin: 0 0 0.5rem;
    letter-spacing: -0.01em;
  }

  .eb-subtitle {
    font-size: 0.9rem;
    color: #71717a;
    margin: 0 0 1.5rem;
    line-height: 1.5;
  }

  .eb-details {
    text-align: left;
    margin-bottom: 1.5rem;
  }

  .eb-summary {
    font-size: 0.8rem;
    color: #52525b;
    cursor: pointer;
    user-select: none;
    margin-bottom: 0.5rem;
    list-style: none;
  }
  .eb-summary::-webkit-details-marker { display: none; }
  .eb-summary::before { content: "▶ "; font-size: 0.65rem; }
  details[open] .eb-summary::before { content: "▼ "; }

  .eb-pre {
    font-size: 0.75rem;
    color: #fca5a5;
    background: rgba(239, 68, 68, 0.06);
    border: 1px solid rgba(239, 68, 68, 0.12);
    border-radius: 0.5rem;
    padding: 0.75rem;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
    line-height: 1.5;
  }

  .eb-actions {
    display: flex;
    gap: 0.625rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .eb-btn-primary {
    padding: 0.6rem 1.4rem;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    background: #ef4444;
    color: #fff;
    transition: background 0.15s, transform 0.1s;
  }
  .eb-btn-primary:hover  { background: #dc2626; }
  .eb-btn-primary:active { transform: scale(0.97); }

  .eb-btn-secondary {
    padding: 0.6rem 1.4rem;
    border-radius: 0.5rem;
    border: 1px solid #3f3f46;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    background: transparent;
    color: #a1a1aa;
    transition: border-color 0.15s, color 0.15s, transform 0.1s;
  }
  .eb-btn-secondary:hover  { border-color: #71717a; color: #d4d4d8; }
  .eb-btn-secondary:active { transform: scale(0.97); }
`;
