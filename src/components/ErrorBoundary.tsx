import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-destructive/10 p-6 rounded-full mb-6">
                        <AlertTriangle className="w-16 h-16 text-destructive" />
                    </div>
                    <h1 className="text-3xl font-bold font-display mb-4">Oops! Something went wrong.</h1>
                    <p className="text-muted-foreground max-w-md mb-8">
                        We encountered an unexpected error. Please try refreshing the page or navigating back to the home screen.
                    </p>
                    
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <div className="bg-secondary p-4 rounded-lg text-left w-full max-w-2xl mb-8 overflow-auto border border-border">
                            <p className="text-destructive font-mono text-sm font-bold mb-2">
                                {this.state.error.toString()}
                            </p>
                            <pre className="text-muted-foreground font-mono text-xs whitespace-pre-wrap">
                                {this.state.error.stack}
                            </pre>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button onClick={this.handleReset} className="gap-2">
                            <RefreshCw className="w-4 h-4" /> Refresh Page
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = '/'} className="gap-2">
                            <Home className="w-4 h-4" /> Go Home
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
