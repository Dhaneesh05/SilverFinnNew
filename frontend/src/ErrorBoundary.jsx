import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#222', color: 'red', height: '100vh', overflow: 'auto', zIndex: 9999, position: 'relative' }}>
          <h1>React Crashed</h1>
          <pre style={{ whiteSpace: 'pre-wrap', fontWeight: 'bold' }}>{this.state.error && this.state.error.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '20px' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
