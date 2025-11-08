import React,{useContext,createContext,useState,useEffect} from 'react';

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

    //on visisting the app, check if user is logged in
    //flow->when user logs in, backend sets a httpOnly cookie
    //on app load, we make a request to backend to verify the cookie
    //if valid, we set isLoggedIn to true
    useEffect(() => {
    fetch('http://localhost:8080/whoAmI', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(user => {
        if (user) {
          setAuthUser(user);
          setIsLoggedIn(true);
        }
      });
  }, []);

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

