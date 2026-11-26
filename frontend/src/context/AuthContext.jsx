import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Prevent duplicate session restoration
  const restoreAttempted = useRef(false);

  // Always keep the latest access token available
  const accessTokenRef = useRef(null);

  // Share one refresh request between simultaneous API failures
  const refreshPromiseRef = useRef(null);

  // AXIOS INTERCEPTORS
  useEffect(() => {
    // REQUEST INTERCEPTOR
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = accessTokenRef.current;

        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // RESPONSE INTERCEPTOR
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,

      async (error) => {
        const originalRequest = error.config;

        // Only handle unauthorized requests
        if (
          error.response?.status !== 401 ||
          !originalRequest ||
          originalRequest._retry
        ) {
          return Promise.reject(error);
        }

        // Do not refresh when login, refresh or logout itself fails
        const requestUrl = originalRequest.url || "";

        const isAuthRequest = [
          "/auth/login",
          "/auth/refresh",
          "/auth/logout",
        ].some((url) => requestUrl.includes(url));

        if (isAuthRequest) {
          return Promise.reject(error);
        }

        // Prevent retrying the same request repeatedly
        originalRequest._retry = true;

        try {
          // Create only one refresh request at a time
          if (!refreshPromiseRef.current) {
            refreshPromiseRef.current = api
              .post("/auth/refresh")
              .then((response) => {
                const { accessToken, user } = response.data;

                if (!accessToken || !user) {
                  throw new Error(
                    "Invalid refresh response from server"
                  );
                }

                // Update token immediately
                accessTokenRef.current = accessToken;

                setAccessToken(accessToken);
                setUser(user);

                return accessToken;
              })
              .catch((refreshError) => {
                accessTokenRef.current = null;

                setAccessToken(null);
                setUser(null);

                throw refreshError;
              })
              .finally(() => {
                refreshPromiseRef.current = null;
              });
          }

          // Wait for the shared refresh request
          const newAccessToken = await refreshPromiseRef.current;

          // Attach the new token to the failed request
          originalRequest.headers =
            originalRequest.headers || {};

          originalRequest.headers.Authorization =
            `Bearer ${newAccessToken}`;

          // Retry the original API request
          return api(originalRequest);

        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
    );

    // Clean up interceptors
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // LOGIN
  const login = useCallback(async (credentials) => {
    const response = await api.post("/auth/login", {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });

    const { accessToken, user } = response.data;

    if (!accessToken || !user) {
      throw new Error("Invalid login response from server");
    }

    accessTokenRef.current = accessToken;

    setAccessToken(accessToken);
    setUser(user);

    return response.data;
  }, []);

  // RESTORE SESSION
  useEffect(() => {
    if (restoreAttempted.current) return;

    restoreAttempted.current = true;

    const restoreSession = async () => {
      try {
        const response = await api.post("/auth/refresh");

        const { accessToken, user } = response.data;

        if (!accessToken || !user) {
          throw new Error(
            "Invalid refresh response from server"
          );
        }

        accessTokenRef.current = accessToken;

        setAccessToken(accessToken);
        setUser(user);

      } catch (error) {
        accessTokenRef.current = null;

        setAccessToken(null);
        setUser(null);

        if (error.response?.status !== 401) {
          console.error(
            "Session restoration failed:",
            error
          );
        }
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");

      accessTokenRef.current = null;

      setAccessToken(null);
      setUser(null);

      return { success: true };

    } catch (error) {
      console.error("Logout failed:", error);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to contact the server. Please try again.",
      };
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken && user),
      isInitializing,
      login,
      logout,
    }),
    [
      user,
      accessToken,
      isInitializing,
      login,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
