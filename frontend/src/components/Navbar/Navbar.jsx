import { useContext, useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/frontend_assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { getTotalCartAmount, token, setToken, search, setSearch } = useContext(StoreContext);
  const navigate=useNavigate();

  const logout=()=>{
    localStorage.removeItem("token");
    setToken("");
    toast.success("Logout Successfully")
    navigate("/");
  }

  const selectMenu = (value) => {
    setMenu(value);
    setShowMobileMenu(false);
  };

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} alt="" className="logo" />
      </Link>
      <ul className={`navbar-menu${showMobileMenu ? " show-mobile" : ""}`}>
        <Link
          to="/"
          onClick={() => selectMenu("home")}
          className={menu === "home" ? "active" : ""}
        >
          home
        </Link>
        <a
          href="#explore-menu"
          onClick={() => selectMenu("menu")}
          className={menu === "menu" ? "active" : ""}
        >
          menu
        </a>
        <Link
          to="/track"
          onClick={() => selectMenu("track")}
          className={menu === "track" ? "active" : ""}
        >
          track order
        </Link>
        <a
          href="#footer"
          onClick={() => selectMenu("contact-us")}
          className={menu === "contact-us" ? "active" : ""}
        >
          contact us
        </a>
      </ul>
      <div className="navbar-right">
        <button
          type="button"
          className={`navbar-hamburger${showMobileMenu ? " open" : ""}`}
          onClick={() => setShowMobileMenu((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <img
          src={assets.search_icon}
          alt=""
          onClick={() => setShowSearch((prev) => !prev)}
          className="navbar-search-toggle"
        />
        {showSearch && (
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search dishes..."
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
        <div className="navbar-search-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="" />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>
        {!token ? (
          <button onClick={() => setShowLogin(true)}>sign in</button>
        ) : (
          <div className="navbar-profile">
            <img src={assets.profile_icon} alt="" />
            <ul className="nav-profile-dropdown">
              <li onClick={()=>navigate("/myorders")}><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
              <hr />
              <li onClick={logout}><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
