import { Navigate, Outlet } from "react-router-dom";
import { getCachedProfile } from "../controllers/profileController";
import { ROUTES } from "../constants/routes";

// Sends non-admin users back to the dashboard
const RequireAdmin = () => {
  const profile = getCachedProfile();
  return profile?.isAdmin ? <Outlet /> : <Navigate to={ROUTES.DASHBOARD} replace />;
};

export default RequireAdmin;