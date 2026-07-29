let activeRegistrationSuccessToken: string | null = null;

export function createRegistrationSuccessToken(): string {
  activeRegistrationSuccessToken = crypto.randomUUID();
  return activeRegistrationSuccessToken;
}

export function isRegistrationSuccessToken(token: string | null): boolean {
  return Boolean(
    token &&
      activeRegistrationSuccessToken &&
      token === activeRegistrationSuccessToken,
  );
}

export function clearRegistrationSuccessToken(): void {
  activeRegistrationSuccessToken = null;
}
