import { useContext } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import {useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate=useNavigate();
  const { token, isStaff, isSuperAdmin, logout: doLogout } = useContext(StoreContext);
  const isAuthenticated = token && isStaff;

  const logout=()=>{
    doLogout();
    toast.success("Logout Successfully")
    navigate("/");
  }
  return (
    <div className="navbar">
      <img className="logo" src={assets.logo} alt="" />
      {isAuthenticated ? (
        <div className="navbar-right">
          <span className="navbar-role-badge">{isSuperAdmin ? "Super Admin" : "Staff"}</span>
          <button className="navbar-logout" onClick={logout}>Logout</button>
          <img className="profile" src={assets.profile_image} alt="" />
        </div>
      ) : (
        <p className="login-conditon" onClick={()=>navigate("/")}>Login</p>
      )}
    </div>
  );
};

export default Navbar;
