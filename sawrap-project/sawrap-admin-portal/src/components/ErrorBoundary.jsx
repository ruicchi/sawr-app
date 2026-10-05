import React from 'react';

// Hinuhuli nito ang ANUMANG hindi inaasahang error sa buong app (hal. quota errors,
// undefined variables, atbp.) para hindi na maging blangkong puting screen ang lumalabas
// sa customer/owner - may magandang fallback screen na lang sila makikita.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('SaWrap Admin Portal crashed:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
          <div className="max-w-sm w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-lg font-black text-gray-800">Something went wrong</h2>
            <p className="text-xs text-gray-500">
              May naganap na hindi inaasahang error. Hindi ito dapat mangyari - i-reload na lang ang page para magpatuloy.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full rounded-2xl bg-amber-400 py-3 text-xs font-bold text-white hover:bg-amber-500 transition-all cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
