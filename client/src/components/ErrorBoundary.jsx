import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('React Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Algo salió mal</h1>
                        <p className="text-gray-600 mb-4">
                            La aplicación encontró un error inesperado. Por favor, recarga la página.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-primary text-textMain px-6 py-2 rounded-lg hover:bg-secondary transition-colors"
                        >
                            Recargar página
                        </button>
                        {process.env.NODE_ENV === 'development' && (
                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm text-gray-500">Detalles del error</summary>
                                <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                                    {this.state.error?.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
