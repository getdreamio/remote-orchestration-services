import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthUser, RegisterRequest } from "../types/auth";
import { config } from '@/config/env';
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface JwtPayload {
  unique_name?: string;
  email?: string;
  nameid?: string;
  role?: string | string[];
}

export const useAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const parseJwtToken = (token: string): AuthUser => {
    const decoded = jwtDecode<JwtPayload>(token);
    return {
      id: decoded.nameid || '',
      email: decoded.email || '',
      given_name: decoded.email || '',
      family_name: decoded.email || '',
      name: decoded.unique_name || decoded.email || '',
      roles: Array.isArray(decoded.role) ? decoded.role : decoded.role ? [decoded.role] : []
    };
  };

  useEffect(() => {
    // Load saved auth state
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    
    if (savedToken) {
      setToken(savedToken);
      try {
        const userData = parseJwtToken(savedToken);
        setUser(userData);
        // Update stored user data with latest from token
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      } catch (error) {
        console.error('Error parsing JWT token:', error);
        clearAuthState();
      }
    }
    
    setIsLoading(false);
  }, []);

  const saveAuthState = (token: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    const userData = parseJwtToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  };

  const clearAuthState = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: email,
          Password: password
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      saveAuthState(data.token, parseJwtToken(data.token));
      navigate("/");
    } catch (error) {
      throw error;
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${config.backendUrl}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } finally {
      clearAuthState();
      navigate("/auth/login");
    }
  }, [token, navigate]);

  const register = useCallback(async (userData: RegisterRequest) => {
    const response = await fetch(`${config.backendUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    const data = await response.json();
    navigate("/auth/login", {
      state: { message: "Registration successful! You can now log in." }
    });
  }, [navigate]);

  const hasRole = useCallback((role: string) => {
    return user?.roles.includes(role) || false;
  }, [user]);

  return {
    isAuthenticated: !!token,
    isLoading,
    user,
    token,
    login,
    logout,
    register,
    hasRole
  };
};
