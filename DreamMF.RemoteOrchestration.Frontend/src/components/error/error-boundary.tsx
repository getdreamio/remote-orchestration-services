import React from 'react';
import ErrorDisplay from './error-display';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // You can log the error to an error reporting service here
        console.error('Error caught by boundary:', error, errorInfo);
    }

    resetError = () => {
        this.setState({
            hasError: false,
            error: null
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorDisplay
                    error={this.state.error || undefined}
                    resetError={this.resetError}
                    message="Something went wrong in the application"
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
