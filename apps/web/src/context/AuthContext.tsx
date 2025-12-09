import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
// import { useNavigate } from 'react-router-dom'; // Can't use hook here easily if provider is inside Router, but usually it is.

interface User {
    id: number;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if we have a token in memory or try to refresh
        // For MVP, we'll implement a simple 'check auth' on mount via API if we want persistence
        // OR just rely on local state if we don't handle refresh on load yet.

        // Simulating a check or restoring from localStorage (if we used it, but we use cookies for refresh)
        // Real implementation: Call /api/v1/auth/refresh to get a new access token on load

        const checkAuth = async () => {
            try {
                // Try to refresh silently
                const res = await axios.post('http://localhost:4000/api/v1/auth/refresh', {}, { withCredentials: true });
                if (res.data.accessToken && res.data.user) {
                    setUser(res.data.user);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
                } else {
                    setUser(null);
                    delete axios.defaults.headers.common['Authorization'];
                }
            } catch (e) {
                // Not authenticated
                setUser(null);
                delete axios.defaults.headers.common['Authorization'];
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = (token: string, userData: User) => {
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:4000/api/v1/auth/logout', {}, { withCredentials: true });
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
