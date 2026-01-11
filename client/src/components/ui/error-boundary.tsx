import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
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

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                        <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Bir Hata Oluştu</h1>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                        Sayfa yüklenirken beklenmedik bir sorun oluştu. İnternet bağlantınızı kontrol edip tekrar deneyin.
                    </p>
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                        >
                            Sayfayı Yenile
                        </Button>
                        <Button
                            variant="default"
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                        >
                            Önbelleği Temizle
                        </Button>
                    </div>
                    {this.state.error && (
                        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-left w-full max-w-md overflow-auto text-xs font-mono text-muted-foreground">
                            {this.state.error.message}
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
