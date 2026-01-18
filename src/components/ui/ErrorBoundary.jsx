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
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFCF0] text-theme-primary p-4 text-center">
                    <h1 className="text-2xl font-bold mb-4">앗! 문제가 발생했습니다.</h1>
                    <p className="text-black/70 mb-4">페이지를 새로고침 해보시거나 잠시 후 다시 시도해주세요.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-theme-primary text-white rounded-xl shadow-lg"
                    >
                        새로고침
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <pre className="mt-8 text-left text-xs bg-black/10 p-4 rounded-lg overflow-auto max-w-full">
                            {this.state.error?.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
