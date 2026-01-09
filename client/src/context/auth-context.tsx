import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";

interface AuthContextType {
    user: { username: string } | null;
    isLoading: boolean;
    login: (username: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<{ username: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [, setLocation] = useLocation();

    useEffect(() => {
        // Check for existing session
        const storedUser = localStorage.getItem("salon_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newUser = { username };
        setUser(newUser);
        localStorage.setItem("salon_user", JSON.stringify(newUser));
        setLocation("/");
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("salon_user");
        setLocation("/login");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
    const { user, isLoading } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (!isLoading && !user) {
            setLocation("/login");
        }
    }, [user, isLoading, setLocation]);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>;
    }

    if (!user) {
        return null;
    }

    return <Component />;
}
