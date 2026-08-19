import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const ProtectedRoute = ({ children, requireSuperAdmin = false }) => {
  const { token, isStaff, isSuperAdmin } = useContext(StoreContext);

  if (!token || !isStaff) {
    return <Navigate to="/" replace />;
  }
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/orders" replace />;
  }
  return children;
};

export default ProtectedRoute;
