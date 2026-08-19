import { useContext, useEffect, useState } from "react";
import "./Login.css";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { isStaff, isSuperAdmin, token, login } = useContext(StoreContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };
  const onLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/api/user/login", data);
      if (response.data.success) {
        if (response.data.role === "admin" || response.data.role === "subadmin") {
          login(response.data.token, response.data.role);
          toast.success("Login Successfully");
          navigate(response.data.role === "admin" ? "/dashboard" : "/orders");
        } else {
          toast.error("You are not authorized to access the admin panel");
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      // network/5xx errors are surfaced globally by the api interceptor
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isStaff && token) {
      navigate(isSuperAdmin ? "/dashboard" : "/orders");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>Admin Login</h2>
          <p className="login-popup-subtitle">Sign in to manage your restaurant</p>
        </div>
        <div className="login-popup-inputs">
          <input
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder="Your email"
            required
          />
          <input
            name="password"
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            placeholder="Your password"
            required
          />
        </div>
        <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
    </div>
  );
};

export default Login;
