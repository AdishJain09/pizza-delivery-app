import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logoutUser, admin, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Pizza Delivery</Link>
      <div className="nav-links">
        {user && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/build-pizza">Build a Pizza</Link>
            <Link to="/orders">My Orders</Link>
            <button
              onClick={() => {
                logoutUser();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </>
        )}
        {admin && (
          <>
            <Link to="/admin/dashboard">Inventory</Link>
            <Link to="/admin/orders">Orders</Link>
            <button
              onClick={() => {
                logoutAdmin();
                navigate("/admin/login");
              }}
            >
              Admin Logout
            </button>
          </>
        )}
        {!user && !admin && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/admin/login">Admin</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
