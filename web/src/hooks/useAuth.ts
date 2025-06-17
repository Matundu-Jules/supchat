import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login as loginAction } from "@store/authSlice";
import type { AppDispatch } from "@store/store";
import type { LoginData } from "@services/authApi";
import { loginApi } from "@services/authApi";

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const login = async (credentials: LoginData) => {
    const data = await loginApi(credentials);
    dispatch(loginAction(data.user));
    const redirect =
      (location.state as any)?.redirect ||
      sessionStorage.getItem("redirectAfterAuth") ||
      "/";
    navigate(redirect, { replace: true });
    sessionStorage.removeItem("redirectAfterAuth");
  };

  return { login };
}
