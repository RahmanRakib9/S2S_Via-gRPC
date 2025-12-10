import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setUserContext, clearUserContext } from '../utils/sentry';
import { tokenUtil } from '../utils/token.util';
import { authService, User } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && tokenUtil.hasToken();

  useEffect(() => {
    const initAuth = async () => {
      if (tokenUtil.hasToken()) {
        try {
          const token = tokenUtil.getAccessToken();
          if (token) {
          const response = await authService.getMe(token);
          setUser(response.data);
          setUserContext({
            id: response.data.id,
            email: response.data.email,
            username: response.data.username,
          });
          }
        } catch (error) {
          console.error('Failed to get user:', error);
          clearUserContext();
          tokenUtil.clearTokens();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    tokenUtil.setTokens(response.data.accessToken, response.data.refreshToken);
    setUser(response.data.user);
    setUserContext({
      id: response.data.user.id,
      email: response.data.user.email,
      username: response.data.user.username,
    });
  };

  const register = async (email: string, username: string, password: string) => {
    const response = await authService.register({ email, username, password });
    tokenUtil.setTokens(response.data.accessToken, response.data.refreshToken);
    setUser(response.data.user);
    setUserContext({
      id: response.data.user.id,
      email: response.data.user.email,
      username: response.data.user.username,
    });
  };

  const logout = () => {
    tokenUtil.clearTokens();
    setUser(null);
    clearUserContext();
  };

  const refreshUser = async () => {
    if (tokenUtil.hasToken()) {
      try {
        const token = tokenUtil.getAccessToken();
        if (token) {
          const response = await authService.getMe(token);
          setUser(response.data);
          setUserContext({
            id: response.data.id,
            email: response.data.email,
            username: response.data.username,
          });
        }
      } catch (error) {
        console.error('Failed to refresh user:', error);
        clearUserContext();
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

