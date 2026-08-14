"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  completeRegistration as completeRegistrationRequest,
  getCurrentUser,
  logout as logoutRequest,
  requestOtp as requestOtpRequest,
  updateProfile as updateProfileRequest,
  verifyOtp as verifyOtpRequest,
} from "@/features/auth/api/auth";
import type {
  AuthenticationState,
  CompleteRegistrationPayload,
  ProfileUpdatePayload,
  User,
} from "@/features/auth/types";
import {
  ApiError,
  getApiErrorMessage,
  NETWORK_ERROR_MESSAGE,
} from "@/lib/api/client";

interface AuthContextValue extends AuthenticationState {
  refreshCurrentUser: () => Promise<User | null>;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<User>;
  completeRegistration: (
    payload: CompleteRegistrationPayload,
  ) => Promise<User>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<User>;
  logout: () => Promise<void>;
}

const initialState: AuthenticationState = {
  user: null,
  isAuthenticated: false,
  isProfileComplete: false,
  isInitializing: true,
  initializationError: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

function authenticatedState(user: User): AuthenticationState {
  return {
    user,
    isAuthenticated: true,
    isProfileComplete: user.is_profile_complete,
    isInitializing: false,
    initializationError: null,
  };
}

function unauthenticatedState(): AuthenticationState {
  return {
    user: null,
    isAuthenticated: false,
    isProfileComplete: false,
    isInitializing: false,
    initializationError: null,
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthenticationState>(initialState);
  const hasInitializedRef = useRef(false);
  const currentUserRequestRef = useRef<Promise<User | null> | null>(null);

  const refreshCurrentUser = useCallback((): Promise<User | null> => {
    if (currentUserRequestRef.current) {
      return currentUserRequestRef.current;
    }

    const request = getCurrentUser()
      .then(({ user }) => {
        setState(authenticatedState(user));
        return user;
      })
      .catch((error: unknown) => {
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          setState(unauthenticatedState());
          return null;
        }

        setState((current) => ({
          ...current,
          isInitializing: false,
          initializationError: getApiErrorMessage(error),
        }));
        throw error;
      })
      .finally(() => {
        if (currentUserRequestRef.current === request) {
          currentUserRequestRef.current = null;
        }
      });

    currentUserRequestRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;
    refreshCurrentUser().catch(() => undefined);
  }, [refreshCurrentUser]);

  const requestOtp = useCallback(async (phone: string): Promise<void> => {
    await requestOtpRequest(phone);
  }, []);

  const verifyOtp = useCallback(
    async (phone: string, code: string): Promise<User> => {
      await verifyOtpRequest(phone, code);
      const user = await refreshCurrentUser();

      if (!user) {
        throw new ApiError(NETWORK_ERROR_MESSAGE, 403);
      }

      return user;
    },
    [refreshCurrentUser],
  );

  const completeRegistration = useCallback(
    async (payload: CompleteRegistrationPayload): Promise<User> => {
      const { user } = await completeRegistrationRequest(payload);
      setState(authenticatedState(user));

      const confirmedUser = await refreshCurrentUser();
      if (!confirmedUser?.is_profile_complete) {
        throw new ApiError(
          "تکمیل حساب کاربری تأیید نشد. دوباره تلاش کنید.",
          500,
        );
      }

      return confirmedUser;
    },
    [refreshCurrentUser],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutRequest();
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        (error.status !== 401 && error.status !== 403)
      ) {
        throw error;
      }
    }

    setState(unauthenticatedState());
  }, []);

  const updateProfile = useCallback(
    async (payload: ProfileUpdatePayload): Promise<User> => {
      const { user } = await updateProfileRequest(payload);
      setState(authenticatedState(user));
      return user;
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      refreshCurrentUser,
      requestOtp,
      verifyOtp,
      completeRegistration,
      updateProfile,
      logout,
    }),
    [
      completeRegistration,
      logout,
      refreshCurrentUser,
      requestOtp,
      state,
      updateProfile,
      verifyOtp,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
