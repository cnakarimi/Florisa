"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUser,
  type AuthUser,
} from "@/features/auth/api/auth";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";

export type CurrentUserState =
  | { status: "loading"; user: null; error: null }
  | { status: "authenticated"; user: AuthUser; error: null }
  | { status: "unauthenticated"; user: null; error: null }
  | { status: "error"; user: null; error: string };

let cachedUser: AuthUser | null | undefined;
let currentUserRequest: Promise<AuthUser | null> | null = null;

function stateFromCache(): CurrentUserState {
  if (cachedUser === undefined) {
    return { status: "loading", user: null, error: null };
  }

  if (cachedUser === null) {
    return { status: "unauthenticated", user: null, error: null };
  }

  return { status: "authenticated", user: cachedUser, error: null };
}

async function loadCurrentUser(): Promise<AuthUser | null> {
  if (cachedUser !== undefined) {
    return cachedUser;
  }

  if (!currentUserRequest) {
    currentUserRequest = getCurrentUser()
      .then(({ user }) => {
        cachedUser = user;
        return user;
      })
      .catch((error: unknown) => {
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          cachedUser = null;
          return null;
        }

        throw error;
      })
      .finally(() => {
        currentUserRequest = null;
      });
  }

  return currentUserRequest;
}

export function setCurrentUserCache(user: AuthUser): void {
  cachedUser = user;
}

export function clearCurrentUserCache(): void {
  cachedUser = null;
  currentUserRequest = null;
}

export function invalidateCurrentUserCache(): void {
  cachedUser = undefined;
  currentUserRequest = null;
}

export function useCurrentUser(): CurrentUserState {
  const [state, setState] = useState<CurrentUserState>(stateFromCache);

  useEffect(() => {
    let isActive = true;

    loadCurrentUser()
      .then((user) => {
        if (!isActive) {
          return;
        }

        setState(
          user
            ? { status: "authenticated", user, error: null }
            : { status: "unauthenticated", user: null, error: null },
        );
      })
      .catch((error: unknown) => {
        if (isActive) {
          setState({
            status: "error",
            user: null,
            error: getApiErrorMessage(error),
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return state;
}
