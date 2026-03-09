import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'coach' | 'athlete';

interface User {
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (name: string, email: string, role: UserRole) => void;
  logout: () => void;
  switchRole: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  switchRole: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (name: string, email: string, role: UserRole) => {
    setUser({ name, email, role });
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = () => {
    if (user) {
      setUser({ ...user, role: user.role === 'coach' ? 'athlete' : 'coach' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        logout,
        switchRole,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
