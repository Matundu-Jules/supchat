// src/components/PrivateRoute/PrivateRoute.tsx

import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@store/store";

const PrivateRoute: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const authLoading = useSelector((state: RootState) => state.auth.isLoading);

  if (authLoading) {
    return <div className="loading">Chargement...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
