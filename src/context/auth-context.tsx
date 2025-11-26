import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import type { User } from "@/api/auth-api";

const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
} as const;

type AuthState = {
  token: string | null;
  user: User | null;
};

type AuthContextType = AuthState & {
  isReady: boolean;
  isLoggedIn: () => boolean;
  setTokenAndUser: (newToken: string, newUser: User) => void;
  clearTokenAndUser: () => void;
};

type JwtPayload = {
  exp: number;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    user: null,
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (storedToken && storedUser) {
      setAuthState({
        token: storedToken,
        user: JSON.parse(storedUser),
      });
    }

    setIsReady(true);
  }, []);

  function isTokenExpired(): boolean {
    if (!authState.token) return true;

    try {
      const decoded = jwtDecode<JwtPayload>(authState.token);
      const now = Date.now() / 1000;
      return decoded.exp < now;
    } catch {
      return true;
    }
  }

  function isLoggedIn(): boolean {
    return !isTokenExpired() && !!authState.user;
  }

  function setTokenAndUser(newToken: string, newUser: User) {
    setAuthState({ token: newToken, user: newUser });
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
  }

  function clearTokenAndUser() {
    setAuthState({ token: null, user: null });
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  return (
    <AuthContext.Provider
      value={{
        token: authState.token,
        user: authState.user,
        isReady,
        isLoggedIn,
        setTokenAndUser,
        clearTokenAndUser,
      }}
    >
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
