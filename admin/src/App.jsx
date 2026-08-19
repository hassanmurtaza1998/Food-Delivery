import { useContext, Suspense, lazy } from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes } from "react-router-dom";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import Promos from "./pages/Promos/Promos";
import Staff from "./pages/Staff/Staff";
import ActivityLog from "./pages/ActivityLog/ActivityLog";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login/Login";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { StoreContext } from "./context/StoreContext";

// Dashboard pulls in the charting library — keep it out of the main bundle.
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));

const App = () => {
  const { token, isStaff } = useContext(StoreContext);
  const isAuthenticated = token && isStaff;

  return (
    <div>
      <ToastContainer position="top-right" />
      <Navbar />
      {isAuthenticated && <hr />}
      <div className="app-content">
        {isAuthenticated && <Sidebar />}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireSuperAdmin>
                <Suspense fallback={<div className="admin-page-loading">Loading dashboard...</div>}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add"
            element={
              <ProtectedRoute requireSuperAdmin>
                <Add />
              </ProtectedRoute>
            }
          />
          <Route
            path="/list"
            element={
              <ProtectedRoute requireSuperAdmin>
                <List />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/promos"
            element={
              <ProtectedRoute requireSuperAdmin>
                <Promos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute requireSuperAdmin>
                <Staff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <ProtectedRoute requireSuperAdmin>
                <ActivityLog />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
