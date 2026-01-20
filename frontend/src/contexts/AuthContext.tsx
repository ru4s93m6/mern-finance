import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface User {
    _id?: string;
    id: string; // supporting both for safety
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const { data } = await api.get('/auth/me');
            if (data.success) {
                setUser({ ...data.data, id: data.data._id }); // Normalize Access
            }
        } catch (error) {
            // Not authenticated
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            if (data.success) {
                setUser(data.user);
                toast.success('登入成功');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || '登入失敗');
            throw error;
        }
    };

    const register = async (username: string, email: string, password: string) => {
        try {
            const { data } = await api.post('/auth/register', { username, email, password });
            if (data.success) {
                setUser(data.user);
                toast.success('註冊成功');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || '註冊失敗');
            throw error;
        }
    };

    const logout = async () => {
        // Since we use cookies, just clear state and maybe call backend to clear cookie
        // For JWT in cookie without blacklist, client side just forgets it? 
        // Better to remove cookie.
        // But backend doesn't have logout route yet. 
        // For now, assume cookies expire or we just clear local state.
        // Actually best practice is to have a logout endpoint to clear cookie.
        // I'll add that later or just clear state.
        setUser(null);
        // Also force reload or clear generic token if stored in LS (we aren't using LS)
        // To clear cookie: document.cookie... but httpOnly can't be cleared by JS.
        // So we NEED logout endpoint. I will add it to backend task list or just ignore for now and clear state.
        // If I clear state, next refresh will fetch /me again and if cookie is still there, it logs back in.
        // So I MUST add logout endpoint.
        // For this step I will implement client logic and then add backend logout later.
        try {
            await api.get('/auth/logout');
        } catch (e) {
            console.error('Logout failed', e);
        }
        setUser(null);
        // window.location.href = '/login'; // Let the router handle cleanup or redirect if protected route
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
