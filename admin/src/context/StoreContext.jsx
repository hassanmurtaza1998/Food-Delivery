import { createContext, useState } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  // Read synchronously so the very first render already knows the auth
  // state — loading this in a useEffect created a race where
  // ProtectedRoute's first render (before the effect ran) always saw a
  // logged-out state and bounced any deep link/refresh back to "/".
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");

  const login = (newToken, newRole) => {
    setToken(newToken);
    setRole(newRole);
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
  };

  const logout = () => {
    setToken("");
    setRole("");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("admin");
  };

  const contextValue = {
    token,
    role,
    isSuperAdmin: role === "admin",
    isStaff: role === "admin" || role === "subadmin",
    login,
    logout,
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;
