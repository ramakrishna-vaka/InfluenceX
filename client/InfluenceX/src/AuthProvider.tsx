import React,{useContext,createContext,useState,useEffect} from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

interface AuthContextType {
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
    authUser?: AuthUser| null;
    setAuthUser: (user: AuthUser | null) => void;
}

type AuthUser = {
    id: number;
    email: string;
    name: string;
} | null;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    //on visisting the app, check if user is logged in
    //flow->when user logs in, backend sets a httpOnly cookie
    //on app load, we make a request to backend to verify the cookie
    //if valid, we set isLoggedIn to true
    useEffect(() => {
        fetch('http://localhost:8080/whoAmI', { credentials: 'include' })
            .then(res => {
                if (res.ok) {
                    return res.json();
                } else {
                    setLoading(false);
                    return null;
                }
            })
            .then(user => {
                if (user) {
                    setAuthUser(user);
                    setIsLoggedIn(true);
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);
    
    useEffect(() => {
        if (!loading && !isLoggedIn) {
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register')
            navigate('/');
        }
    }, [isLoggedIn,loading, navigate]);

    const login = () => {
        setIsLoggedIn(true);
    };

    const logout = () => {
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{isLoggedIn, login, logout, authUser, setAuthUser}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

