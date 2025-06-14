// src/components/PublicRoute/PublicRoute.tsx

import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@store/store";
import Loader from "@components/Loader";

const PublicRoute: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const authLoading = useSelector((state: RootState) => state.auth.isLoading);

  if (authLoading) {
    return <Loader />;
  }

  // If the user is logged in => redirect to dashboard (or other)
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, allowed to display the public page (login/register/etc)
  return <Outlet />;
};

export default PublicRoute;
