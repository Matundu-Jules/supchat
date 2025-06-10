// hooks/useAuth.ts
import { useState } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  const login = (t: string) => setToken(t);
  const logout = () => setToken(null);

  return { token, login, logout };
}
